import type { ConversionResultPayload } from "@/types/optolith/converter";
import type {
  CacheBackend,
  CacheChangeDetail,
  CacheChangeEvent,
  CacheState,
  CacheStatus,
  CachedConversionEntry,
  WarningSummary,
} from "@/types/optolith/cache";

const CACHE_SCHEMA_VERSION = 2;
const MAX_ENTRIES = 10;

const DB_NAME = "optolith-converter";
const DB_VERSION = 1;
const STORE_NAME = "recent-conversions";
const LOCAL_STORAGE_KEY = "optolith-converter:recent";

interface StoredEntry extends CachedConversionEntry {
  readonly version: number;
}

interface LocalStoragePayload {
  readonly version: number;
  readonly entries: StoredEntry[];
}

function createDefaultState(): CacheState {
  return { status: "uninitialized", backend: "none" };
}

function toPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

async function openDatabase(): Promise<IDBDatabase> {
  if (!("indexedDB" in window)) {
    throw new Error("IndexedDB is not available");
  }
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
}

async function readIndexedDbEntries(
  db: IDBDatabase,
): Promise<{ entries: StoredEntry[]; hasLegacy: boolean }> {
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index("createdAt");
  const entries: StoredEntry[] = [];
  let hasLegacy = false;

  await new Promise<void>((resolve, reject) => {
    const request = index.openCursor(null, "prev");
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve();
        return;
      }
      const value = cursor.value as StoredEntry;
      if (value.version === CACHE_SCHEMA_VERSION) {
        entries.push(value);
      } else {
        hasLegacy = true;
      }
      cursor.continue();
    };
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to iterate IndexedDB cursor"));
  });

  return { entries, hasLegacy };
}

function awaitTransactionCompletion(
  transaction: IDBTransaction,
): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });
}

async function putIndexedDbEntry(
  db: IDBDatabase,
  entry: StoredEntry,
): Promise<void> {
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await toPromise(store.put(entry));
  await trimIndexedDbEntries(db, transaction);
  await awaitTransactionCompletion(transaction);
}

async function trimIndexedDbEntries(
  db: IDBDatabase,
  externalTransaction?: IDBTransaction,
): Promise<void> {
  const transaction =
    externalTransaction ?? db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index("createdAt");
  let count = 0;

  await new Promise<void>((resolve, reject) => {
    const cursorRequest = index.openCursor(null, "prev");
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor) {
        resolve();
        return;
      }
      count += 1;
      if (count > MAX_ENTRIES) {
        cursor.delete();
      }
      cursor.continue();
    };
    cursorRequest.onerror = () =>
      reject(
        cursorRequest.error ??
          new Error("Failed to trim IndexedDB cache entries"),
      );
  });

  if (!externalTransaction) {
    await awaitTransactionCompletion(transaction);
  }
}

async function deleteIndexedDbEntry(
  db: IDBDatabase,
  id: string,
): Promise<void> {
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await toPromise(store.delete(id));
  await awaitTransactionCompletion(transaction);
}

async function clearIndexedDb(db: IDBDatabase): Promise<void> {
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await toPromise(store.clear());
  await awaitTransactionCompletion(transaction);
}

function computeWarningSummary(
  payload: ConversionResultPayload,
): WarningSummary {
  const parserKeys = new Set<string>();
  const resolverKeys = new Set<string>();
  const exporterKeys = new Set<string>();
  const unresolvedKeys = new Set<string>();
  const overallKeys = new Set<string>();

  const addOverall = (key: string) => {
    overallKeys.add(key);
  };

  (payload.exportedWarnings ?? []).forEach((warning) => {
    exporterKeys.add(warning);
    addOverall(warning);
  });

  (payload.parserWarnings ?? []).forEach((warning) => {
    const key = `[Parser] ${warning.section ?? "general"}: ${warning.message}`;
    parserKeys.add(key);
    addOverall(key);
  });

  (payload.resolverWarnings ?? []).forEach((warning) => {
    const key = `[Resolver] ${warning.section}: ${warning.message}`;
    resolverKeys.add(key);
    addOverall(key);
  });

  Object.entries(payload.unresolved ?? {}).forEach(([section, entries]) => {
    entries.forEach((entry) => {
      const key = `[Resolver] ${section}: ${entry}`;
      unresolvedKeys.add(key);
      addOverall(key);
    });
  });

  return {
    total: overallKeys.size,
    parser: parserKeys.size,
    resolver: resolverKeys.size,
    exporter: exporterKeys.size,
    unresolved: unresolvedKeys.size,
  };
}

function createStoredEntry(
  statBlock: string,
  payload: ConversionResultPayload,
): StoredEntry {
  const createdAt = new Date().toISOString();
  const id =
    typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const name = payload.exported?.name?.trim() ?? "Unnamed conversion";
  return {
    id,
    createdAt,
    name,
    statBlock,
    payload,
    warningSummary: computeWarningSummary(payload),
    version: CACHE_SCHEMA_VERSION,
  };
}

function normalizeEntries(entries: StoredEntry[]): CachedConversionEntry[] {
  return entries
    .filter((entry) => entry.version === CACHE_SCHEMA_VERSION)
    .map((entry) => ({
      id: entry.id,
      createdAt: entry.createdAt,
      name: entry.name,
      statBlock: entry.statBlock,
      payload: entry.payload,
      warningSummary: entry.warningSummary,
    }));
}

function readFromLocalStorage(): StoredEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as LocalStoragePayload;
    if (
      parsed.version !== CACHE_SCHEMA_VERSION ||
      !Array.isArray(parsed.entries)
    ) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return [];
    }
    return parsed.entries;
  } catch {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return [];
  }
}

function writeToLocalStorage(entries: StoredEntry[]): void {
  const payload: LocalStoragePayload = {
    version: CACHE_SCHEMA_VERSION,
    entries: entries.slice(0, MAX_ENTRIES),
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
}

class OptolithConversionCache extends EventTarget {
  private state: CacheState = createDefaultState();
  private entries: CachedConversionEntry[] = [];
  private backend: CacheBackend = "none";
  private db: IDBDatabase | null = null;
  private initializationPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.state.status === "available" || this.initializationPromise) {
      return this.initializationPromise ?? Promise.resolve();
    }
    this.initializationPromise = this.performInitialization();
    await this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      const db = await openDatabase();
      this.db = db;
      this.backend = "indexedDB";
      const { entries, hasLegacy } = await readIndexedDbEntries(db);
      if (hasLegacy) {
        await clearIndexedDb(db);
        this.entries = [];
      } else {
        this.entries = normalizeEntries(entries);
      }
      this.setState("available");
    } catch {
      try {
        const entries = readFromLocalStorage();
        writeToLocalStorage(entries); // ensure schema normalized & trimmed
        this.entries = normalizeEntries(entries);
        this.backend = "localStorage";
        this.setState("available");
      } catch {
        this.backend = "none";
        this.entries = [];
        this.setState("disabled");
      }
    } finally {
      this.initializationPromise = null;
      this.emitChange();
    }
  }

  getState(): CacheState {
    return { ...this.state };
  }

  getEntries(): readonly CachedConversionEntry[] {
    return this.entries.slice();
  }

  async save(
    statBlock: string,
    payload: ConversionResultPayload,
  ): Promise<void> {
    if (this.state.status === "uninitialized") {
      await this.init();
    }
    if (this.state.status !== "available") {
      return;
    }
    const entry = createStoredEntry(statBlock, payload);
    if (this.backend === "indexedDB" && this.db) {
      await putIndexedDbEntry(this.db, {
        ...entry,
        version: CACHE_SCHEMA_VERSION,
      });
      const { entries } = await readIndexedDbEntries(this.db);
      this.entries = normalizeEntries(entries);
    } else if (this.backend === "localStorage") {
      const entries = readFromLocalStorage();
      const next = [entry, ...entries].slice(0, MAX_ENTRIES);
      writeToLocalStorage(next);
      this.entries = normalizeEntries(next);
    }
    this.emitChange();
  }

  async remove(id: string): Promise<void> {
    if (this.state.status !== "available") {
      return;
    }
    if (this.backend === "indexedDB" && this.db) {
      await deleteIndexedDbEntry(this.db, id);
      const { entries } = await readIndexedDbEntries(this.db);
      this.entries = normalizeEntries(entries);
    } else if (this.backend === "localStorage") {
      const entries = readFromLocalStorage().filter((entry) => entry.id !== id);
      writeToLocalStorage(entries);
      this.entries = normalizeEntries(entries);
    }
    this.emitChange();
  }

  async clear(): Promise<void> {
    if (this.state.status !== "available") {
      return;
    }
    if (this.backend === "indexedDB" && this.db) {
      await clearIndexedDb(this.db);
    } else if (this.backend === "localStorage") {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    this.entries = [];
    this.emitChange();
  }

  private setState(status: CacheStatus): void {
    this.state = { status, backend: this.backend };
  }

  private emitChange(): void {
    const detail: CacheChangeDetail = {
      entries: this.entries,
      state: this.state,
    };
    const event: CacheChangeEvent = new CustomEvent("change", { detail });
    this.dispatchEvent(event);
  }
}

export const conversionCache = new OptolithConversionCache();
