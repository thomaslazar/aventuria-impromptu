<template>
  <section class="aventuria-section optolith-view">
    <header class="aventuria-section-header">
      <h1 class="aventuria-section-title">
        {{ t("views.optolithConverter.title") }}
      </h1>
      <p class="aventuria-section-intro optolith-intro">
        {{ t("views.optolithConverter.intro") }}
      </p>
    </header>

    <nav class="optolith-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        class="optolith-tabs__button"
        :class="{ 'optolith-tabs__button--active': activeTab === 'convert' }"
        :aria-selected="activeTab === 'convert'"
        @click="activeTab = 'convert'"
      >
        {{ t("views.optolithConverter.tabs.convert") }}
      </button>
      <button
        type="button"
        role="tab"
        class="optolith-tabs__button"
        :class="{ 'optolith-tabs__button--active': activeTab === 'recent' }"
        :aria-selected="activeTab === 'recent'"
        @click="activeTab = 'recent'"
      >
        {{ t("views.optolithConverter.tabs.recent") }}
      </button>
    </nav>

    <div v-if="activeTab === 'convert'" class="optolith-panel">
      <article class="aventuria-card aventuria-card--table optolith-card">
        <div class="optolith-callout optolith-callout--accent" role="note">
          <span>
            {{ t("views.optolithConverter.roll20Note.prefix") }}
            <a
              class="optolith-roll20__link"
              href="https://roll20.net"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ t("views.optolithConverter.roll20Note.linkText") }}
            </a>
            {{ t("views.optolithConverter.roll20Note.suffix") }}
          </span>
          <span>
            {{ t("views.optolithConverter.languageNote") }}
          </span>
          <span>
            {{ t("views.optolithConverter.bugReportNote.prefix") }}
            <a
              class="optolith-github__link"
              href="https://github.com/thomaslazar/aventuria-impromptu/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ t("views.optolithConverter.bugReportNote.linkText") }}
            </a>
            {{ t("views.optolithConverter.bugReportNote.suffix") }}
          </span>
        </div>

        <section class="optolith-usage">
          <h2 class="aventuria-card-title optolith-usage__title">
            {{ t("views.optolithConverter.usage.title") }}
          </h2>
          <ol class="optolith-usage__list">
            <li>{{ t("views.optolithConverter.usage.steps.paste") }}</li>
            <li>{{ t("views.optolithConverter.usage.steps.convert") }}</li>
            <li>{{ t("views.optolithConverter.usage.steps.review") }}</li>
            <li>{{ t("views.optolithConverter.usage.steps.download") }}</li>
          </ol>
        </section>

        <div class="optolith-field-group">
          <label for="stat-block-input" class="optolith-label">
            {{ t("views.optolithConverter.input.label") }}
          </label>
          <textarea
            id="stat-block-input"
            v-model="input"
            class="optolith-textarea"
            :class="{ 'is-invalid': inputTooLong }"
            rows="14"
            :placeholder="t('views.optolithConverter.input.placeholder')"
          ></textarea>
          <div class="optolith-helper">
            {{
              t("views.optolithConverter.input.help", {
                max: MAX_LENGTH,
                current: input.length,
              })
            }}
          </div>
          <p v-if="inputTooLong" class="optolith-inline-error">
            {{ t("views.optolithConverter.input.tooLong") }}
          </p>
        </div>

        <div class="optolith-actions">
          <button
            type="button"
            class="aventuria-button"
            :disabled="disableConvert"
            @click="convert"
          >
            {{ t("views.optolithConverter.buttons.convert") }}
          </button>
          <button
            type="button"
            class="aventuria-button aventuria-button--ghost"
            @click="reset"
            :disabled="status === 'loading'"
          >
            {{ t("views.optolithConverter.buttons.reset") }}
          </button>
          <button
            type="button"
            class="aventuria-button aventuria-button--ghost"
            @click="loadLastResult"
            :disabled="!hasStoredResult || status === 'loading'"
          >
            {{ t("views.optolithConverter.buttons.loadLast") }}
          </button>
        </div>

        <div
          v-if="status === 'loading'"
          class="optolith-callout optolith-callout--info"
          role="status"
        >
          {{ t("views.optolithConverter.loading") }}
        </div>
        <div
          v-if="error"
          class="optolith-callout optolith-callout--danger"
          role="alert"
        >
          {{ error }}
        </div>
      </article>

      <article
        v-if="result"
        class="aventuria-card aventuria-card--table optolith-result"
      >
        <header class="optolith-result__header">
          <div>
            <h2 class="aventuria-card-title optolith-result__title">
              {{ result.exported.name }}
            </h2>
            <p class="optolith-result__meta">
              {{
                t("views.optolithConverter.datasetInfo", {
                  schema: result.manifest.schemaVersion,
                  checksum: result.manifest.sourceChecksum.slice(0, 12),
                })
              }}
            </p>
          </div>
          <div class="optolith-result__actions">
            <button
              type="button"
              class="aventuria-button"
              @click="downloadJson"
            >
              {{ t("views.optolithConverter.buttons.download") }}
            </button>
            <button
              type="button"
              class="aventuria-button aventuria-button--ghost"
              @click="copyWarnings"
            >
              {{ t("views.optolithConverter.buttons.copyWarnings") }}
            </button>
          </div>
        </header>

        <div
          v-if="displayWarnings.length > 0"
          class="optolith-callout optolith-callout--warning"
          role="alert"
        >
          <h3 class="optolith-callout__title">
            {{ t("views.optolithConverter.warnings.title") }}
          </h3>
          <ul class="optolith-callout__list">
            <li v-for="warning in displayWarnings" :key="warning">
              {{ warning }}
            </li>
          </ul>
        </div>

        <details class="optolith-details">
          <summary>
            {{ t("views.optolithConverter.normalizedHeading") }}
          </summary>
          <pre>{{ result.normalizedSource }}</pre>
        </details>

        <details class="optolith-details" open>
          <summary>
            <span class="optolith-details__summary">
              <span class="optolith-details__summary-text">
                {{ t("views.optolithConverter.jsonHeading") }}
              </span>
              <button
                type="button"
                class="aventuria-button aventuria-button--ghost optolith-json-actions__button"
                :title="t('views.optolithConverter.buttons.copyJson')"
                @click.stop.prevent="copyJson"
              >
                <svg
                  class="optolith-json-actions__icon"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fill="currentColor"
                    d="M8 3h9a2 2 0 0 1 2 2v13h-2V5H8zm-3 4h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2m0 2v10h9V9z"
                  />
                </svg>
                <span class="visually-hidden">
                  {{ t("views.optolithConverter.buttons.copyJson") }}
                </span>
              </button>
            </span>
          </summary>
          <pre>{{ formattedJson }}</pre>
        </details>
      </article>
    </div>

    <div v-else class="optolith-panel">
      <article class="aventuria-card aventuria-card--table optolith-history">
        <header class="optolith-history__header">
          <h2 class="aventuria-card-title">
            {{ t("views.optolithConverter.recent.title") }}
          </h2>
          <button
            type="button"
            class="aventuria-button aventuria-button--ghost"
            :disabled="!canClearCache"
            @click="clearHistory"
          >
            {{ t("views.optolithConverter.recent.actions.clear") }}
          </button>
        </header>

        <div
          v-if="cacheState.status === 'disabled'"
          class="optolith-callout optolith-callout--warning"
          role="alert"
        >
          {{ t("views.optolithConverter.recent.disabled") }}
        </div>
        <div
          v-else-if="recentEntries.length === 0"
          class="optolith-history__empty"
        >
          {{ t("views.optolithConverter.recent.empty") }}
        </div>
        <ul v-else class="optolith-history__list">
          <li
            v-for="entry in recentEntries"
            :key="entry.id"
            class="optolith-history__item"
          >
            <button
              type="button"
              class="optolith-history__toggle"
              :aria-expanded="expandedEntryId === entry.id"
              @click="toggleEntry(entry.id)"
            >
              <span class="optolith-history__toggle-name">{{
                entry.name
              }}</span>
              <span class="optolith-history__timestamp">
                {{
                  t("views.optolithConverter.recent.storedAt", {
                    date: entry.formattedDate,
                  })
                }}
              </span>
              <span
                class="optolith-history__warnings"
                :class="{
                  'optolith-history__warnings--has':
                    entry.warningSummary.total > 0,
                }"
                :title="warningBreakdown(entry.warningSummary)"
              >
                {{ warningLabel(entry.warningSummary) }}
              </span>
              <span class="optolith-history__chevron" aria-hidden="true"></span>
            </button>

            <div
              v-if="expandedEntryId === entry.id"
              class="optolith-history__panel"
            >
              <div class="optolith-history__panel-actions">
                <button
                  type="button"
                  class="aventuria-button aventuria-button--ghost"
                  :disabled="!canMutateCache"
                  @click="loadEntry(entry.id)"
                >
                  {{ t("views.optolithConverter.recent.actions.load") }}
                </button>
                <button
                  type="button"
                  class="aventuria-button aventuria-button--ghost"
                  @click="downloadEntry(entry.id)"
                >
                  {{ t("views.optolithConverter.recent.actions.download") }}
                </button>
                <button
                  type="button"
                  class="aventuria-button aventuria-button--ghost"
                  :disabled="!canMutateCache"
                  @click="removeEntry(entry.id)"
                >
                  {{ t("views.optolithConverter.recent.actions.remove") }}
                </button>
              </div>

              <div class="optolith-history__panel-content">
                <section class="optolith-history__section">
                  <h3 class="optolith-history__section-title">
                    {{ t("views.optolithConverter.recent.labels.statBlock") }}
                  </h3>
                  <pre class="optolith-history__pre">{{ entry.statBlock }}</pre>
                </section>
                <section class="optolith-history__section">
                  <h3 class="optolith-history__section-title">
                    {{ t("views.optolithConverter.recent.labels.json") }}
                  </h3>
                  <div
                    class="optolith-json-actions optolith-json-actions--history"
                  >
                    <button
                      type="button"
                      class="aventuria-button aventuria-button--ghost optolith-json-actions__button"
                      :title="t('views.optolithConverter.buttons.copyJson')"
                      @click="copyEntryJson(entry.json)"
                    >
                      <svg
                        class="optolith-json-actions__icon"
                        viewBox="0 0 24 24"
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path
                          fill="currentColor"
                          d="M8 3h9a2 2 0 0 1 2 2v13h-2V5H8zm-3 4h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2m0 2v10h9V9z"
                        />
                      </svg>
                      <span class="visually-hidden">
                        {{ t("views.optolithConverter.buttons.copyJson") }}
                      </span>
                    </button>
                  </div>
                  <pre class="optolith-history__pre">{{ entry.json }}</pre>
                </section>
              </div>
            </div>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import type {
  ConversionRequestMessage,
  ConversionResultPayload,
  ConverterWorkerMessage,
} from "@/types/optolith/converter";
import { conversionCache } from "@/services/optolith/conversionCache";
import type {
  CacheChangeEvent,
  CacheState,
  CachedConversionEntry,
  WarningSummary,
} from "@/types/optolith/cache";

const { t, locale } = useI18n();

const MAX_LENGTH = 6000;
type Status = "idle" | "loading" | "success" | "error";

const input = ref("");
const status = ref<Status>("idle");
const error = ref<string | null>(null);
const result = ref<ConversionResultPayload | null>(null);
const worker = ref<Worker | null>(null);
const baseUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;
const cacheState = ref<CacheState>(conversionCache.getState());
const cacheEntries = ref<readonly CachedConversionEntry[]>([]);
const cacheActionPending = ref(false);
const activeTab = ref<"convert" | "recent">("convert");
const expandedEntryId = ref<string | null>(null);

const inputTooLong = computed(() => input.value.length > MAX_LENGTH);
const disableConvert = computed(
  () =>
    status.value === "loading" ||
    input.value.trim().length === 0 ||
    inputTooLong.value,
);
const hasStoredResult = computed(
  () =>
    cacheState.value.status === "available" && cacheEntries.value.length > 0,
);
const formattedJson = computed(() =>
  result.value ? JSON.stringify(result.value.exported, null, 2) : "",
);
const cacheDateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
);

interface CacheEntryViewModel {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
  readonly formattedDate: string;
  readonly statBlock: string;
  readonly json: string;
  readonly warningSummary: WarningSummary;
}

const recentEntries = computed<CacheEntryViewModel[]>(() =>
  cacheEntries.value.map((entry) => ({
    id: entry.id,
    name: entry.name,
    createdAt: entry.createdAt,
    formattedDate: cacheDateFormatter.value.format(new Date(entry.createdAt)),
    statBlock: entry.statBlock,
    json: JSON.stringify(entry.payload.exported, null, 2),
    warningSummary: entry.warningSummary,
  })),
);

const canMutateCache = computed(
  () => cacheState.value.status === "available" && !cacheActionPending.value,
);

const canClearCache = computed(
  () => canMutateCache.value && cacheEntries.value.length > 0,
);
const displayWarnings = computed(() => {
  if (!result.value) {
    return [] as string[];
  }
  const warnings = new Set<string>();
  const localizeWarning = (message: string): string => {
    if (message.startsWith("[Parser] ")) {
      return `${t("views.optolithConverter.warnings.prefixes.parser")} ${message.slice(9)}`;
    }
    if (message.startsWith("[Resolver] ")) {
      return `${t("views.optolithConverter.warnings.prefixes.resolver")} ${message.slice(10)}`;
    }
    if (message.startsWith("[Exporter] ")) {
      return `${t("views.optolithConverter.warnings.prefixes.exporter")} ${message.slice(10)}`;
    }
    return message;
  };
  const exportedWarnings = result.value.exportedWarnings ?? [];
  exportedWarnings.forEach((warning) => warnings.add(localizeWarning(warning)));
  (result.value.parserWarnings ?? []).forEach((warning) =>
    warnings.add(
      localizeWarning(
        `[Parser] ${warning.section ?? "general"}: ${warning.message}`,
      ),
    ),
  );
  (result.value.resolverWarnings ?? []).forEach((warning) =>
    warnings.add(
      localizeWarning(`[Resolver] ${warning.section}: ${warning.message}`),
    ),
  );
  Object.entries(result.value.unresolved ?? {}).forEach(
    ([section, entries]) => {
      entries.forEach((entry) =>
        warnings.add(localizeWarning(`[Resolver] ${section}: ${entry}`)),
      );
    },
  );
  return Array.from(warnings);
});

function ensureWorker(): Worker {
  if (worker.value) {
    return worker.value;
  }
  const instance = new Worker(
    new URL("../workers/optolithConverter.worker.ts", import.meta.url),
    {
      type: "module",
    },
  );
  instance.addEventListener("message", handleWorkerMessage as EventListener);
  worker.value = instance;
  return instance;
}

function handleWorkerMessage(event: MessageEvent<ConverterWorkerMessage>) {
  const message = event.data;
  if (!message) {
    return;
  }
  if (message.type === "error") {
    status.value = "error";
    error.value = message.error;
    return;
  }
  status.value = "success";
  error.value = null;
  result.value = message.payload;
  void conversionCache
    .save(input.value, message.payload)
    .catch((err) => console.error("Failed to persist cached conversion", err));
}

function convert() {
  if (disableConvert.value) {
    return;
  }
  status.value = "loading";
  error.value = null;
  result.value = null;

  const instance = ensureWorker();
  instance.postMessage({
    type: "convert",
    payload: {
      source: input.value,
      baseUrl,
    },
  } satisfies ConversionRequestMessage);
}

function loadCachedEntry(entry: CachedConversionEntry | undefined): void {
  if (!entry) {
    return;
  }
  input.value = entry.statBlock;
  result.value = {
    ...entry.payload,
    exportedWarnings: entry.payload.exportedWarnings ?? [],
  };
  status.value = "success";
  error.value = null;
}

function loadLastResult() {
  loadCachedEntry(cacheEntries.value[0]);
}

function findCachedEntry(id: string): CachedConversionEntry | undefined {
  return cacheEntries.value.find((entry) => entry.id === id);
}

function toggleEntry(id: string): void {
  expandedEntryId.value = expandedEntryId.value === id ? null : id;
}

function loadEntry(id: string): void {
  const entry = findCachedEntry(id);
  if (!entry) {
    return;
  }
  loadCachedEntry(entry);
  activeTab.value = "convert";
  expandedEntryId.value = null;
}

function downloadEntry(id: string): void {
  const entry = findCachedEntry(id);
  if (!entry) {
    return;
  }
  const blob = new Blob([JSON.stringify(entry.payload.exported, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeName = entry.name.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  anchor.href = url;
  anchor.download = `${safeName || "npc"}-optolith.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

async function removeEntry(id: string): Promise<void> {
  if (!canMutateCache.value) {
    return;
  }
  cacheActionPending.value = true;
  try {
    await conversionCache.remove(id);
    expandedEntryId.value = null;
  } catch (err) {
    console.error("Failed to remove cached conversion", err);
  } finally {
    cacheActionPending.value = false;
  }
}

async function clearHistory(): Promise<void> {
  if (!canClearCache.value) {
    return;
  }
  cacheActionPending.value = true;
  try {
    await conversionCache.clear();
    expandedEntryId.value = null;
  } catch (err) {
    console.error("Failed to clear cached conversions", err);
  } finally {
    cacheActionPending.value = false;
  }
}

function warningLabel(summary: WarningSummary): string {
  if (summary.total === 0) {
    return t("views.optolithConverter.recent.warnings.none");
  }
  if (summary.total === 1) {
    return t("views.optolithConverter.recent.warnings.single");
  }
  return t("views.optolithConverter.recent.warnings.multiple", {
    count: summary.total,
  });
}

function warningBreakdown(summary: WarningSummary): string {
  return t("views.optolithConverter.recent.warnings.breakdown", {
    parser: summary.parser,
    resolver: summary.resolver,
    exporter: summary.exporter,
    unresolved: summary.unresolved,
  });
}

function downloadJson() {
  if (!result.value) {
    return;
  }
  const blob = new Blob([JSON.stringify(result.value.exported, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeName = result.value.exported.name
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
  anchor.href = url;
  anchor.download = `${safeName || "npc"}-optolith.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

async function writeToClipboard(text: string, context: string) {
  if (!text) {
    return;
  }
  try {
    if (!navigator?.clipboard?.writeText) {
      throw new Error("Clipboard API not available");
    }
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error(`Failed to copy ${context}`, err);
  }
}

async function copyWarnings() {
  await writeToClipboard(displayWarnings.value.join("\n"), "warnings");
}

async function copyJson() {
  await writeToClipboard(formattedJson.value, "JSON");
}

async function copyEntryJson(json: string) {
  await writeToClipboard(json, "cached JSON");
}

function reset() {
  input.value = "";
  status.value = "idle";
  error.value = null;
  result.value = null;
}

onMounted(() => {
  const handleCacheChange = (event: Event) => {
    const detail = (event as CacheChangeEvent).detail;
    cacheState.value = detail.state;
    cacheEntries.value = detail.entries;
  };

  conversionCache.addEventListener(
    "change",
    handleCacheChange as EventListener,
  );

  void conversionCache
    .init()
    .then(() => {
      cacheState.value = conversionCache.getState();
      cacheEntries.value = conversionCache.getEntries();
      if (cacheEntries.value.length > 0) {
        loadCachedEntry(cacheEntries.value[0]);
      }
    })
    .catch(() => {
      cacheState.value = conversionCache.getState();
      cacheEntries.value = conversionCache.getEntries();
    });

  onBeforeUnmount(() => {
    conversionCache.removeEventListener(
      "change",
      handleCacheChange as EventListener,
    );
  });
});

watch(cacheEntries, (entries) => {
  if (
    expandedEntryId.value &&
    !entries.some((entry) => entry.id === expandedEntryId.value)
  ) {
    expandedEntryId.value = null;
  }
});

onBeforeUnmount(() => {
  if (worker.value) {
    worker.value.terminate();
    worker.value = null;
  }
});
</script>

<style scoped>
.optolith-view {
  display: grid;
  gap: clamp(1.5rem, 2vw, 2.5rem);
}

.optolith-roll20 {
  margin: 0;
  color: rgba(47, 36, 18, 0.9);
  max-width: 52ch;
  font-size: 1rem;
  line-height: 1.6;
}

.optolith-intro {
  color: var(--aventuria-text);
}

.optolith-roll20__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-transform: none;
  color: rgba(173, 116, 28, 0.95);
  font-weight: 600;
}

.optolith-roll20__link:hover,
.optolith-roll20__link:focus-visible {
  color: var(--aventuria-accent-dark);
}

.optolith-github__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-transform: none;
  color: rgba(173, 116, 28, 0.95);
  font-weight: 600;
}

.optolith-github__link:hover,
.optolith-github__link:focus-visible {
  color: var(--aventuria-accent-dark);
}

.optolith-card {
  display: grid;
  gap: 1.75rem;
}

.optolith-callout {
  border-left: 4px solid var(--aventuria-accent);
  padding: 1rem 1.25rem;
  border-radius: calc(var(--aventuria-radius) - 2px);
  background: rgba(197, 143, 45, 0.14);
  color: #4a3614;
  font-weight: 500;
  line-height: 1.4;
}

.optolith-callout--accent {
  background: rgba(197, 143, 45, 0.18);
  border-left-color: rgba(197, 143, 45, 0.9);
  color: rgba(47, 36, 18, 0.9);
  font-weight: 500;
  display: grid;
  gap: 0.35rem;
}

.optolith-callout--warning {
  border-left-color: #ce7f1d;
  background: rgba(206, 127, 29, 0.16);
  color: #4a2a07;
}

.optolith-callout--danger {
  border-left-color: #b3473e;
  background: rgba(179, 71, 62, 0.16);
  color: #5a1d18;
}

.optolith-usage {
  display: grid;
  gap: 0.75rem;
}

.optolith-usage__title {
  margin-bottom: 0;
}

.optolith-usage__list {
  margin: 0;
  padding-left: 1.25rem;
  display: grid;
  gap: 0.5rem;
  font-weight: 500;
}

.optolith-field-group {
  display: grid;
  gap: 0.75rem;
}

.optolith-label {
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: rgba(47, 36, 18, 0.68);
}

.optolith-textarea {
  width: 100%;
  min-height: 18rem;
  padding: 1rem 1.1rem;
  border-radius: var(--aventuria-radius);
  border: 1px solid rgba(47, 36, 18, 0.18);
  background: rgba(255, 255, 255, 0.86);
  font-family:
    ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", "Courier New",
    monospace;
  font-size: 0.95rem;
  color: #2f2412;
  line-height: 1.5;
  resize: vertical;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.optolith-textarea:focus {
  outline: none;
  border-color: rgba(197, 143, 45, 0.65);
  box-shadow: 0 0 0 3px rgba(197, 143, 45, 0.18);
}

.optolith-textarea.is-invalid {
  border-color: rgba(179, 71, 62, 0.75);
  box-shadow: 0 0 0 3px rgba(179, 71, 62, 0.2);
}

.optolith-helper {
  font-size: 0.85rem;
  color: rgba(47, 36, 18, 0.65);
}

.optolith-inline-error {
  margin: 0;
  font-size: 0.85rem;
  color: #7a1d18;
  font-weight: 600;
}

.optolith-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.optolith-tabs {
  display: inline-flex;
  gap: 0.5rem;
  margin-bottom: clamp(0.25rem, 0.6vw, 0.4rem);
}

.optolith-tabs__button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1.3rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--aventuria-text-muted);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
  transition: all 160ms ease;
  border: 1px solid transparent;
  cursor: pointer;
}

.optolith-tabs__button:hover,
.optolith-tabs__button:focus-visible {
  color: var(--aventuria-text);
  border-color: rgba(197, 143, 45, 0.5);
  background: rgba(197, 143, 45, 0.12);
}

.optolith-tabs__button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(197, 143, 45, 0.18);
}

.optolith-tabs__button--active {
  color: var(--aventuria-text);
  border-color: var(--aventuria-border-strong);
  background: linear-gradient(
    135deg,
    rgba(197, 143, 45, 0.35),
    rgba(197, 143, 45, 0.15)
  );
  box-shadow: 0 6px 18px rgba(197, 143, 45, 0.2);
}

.optolith-panel {
  display: grid;
  gap: clamp(1.5rem, 2vw, 2rem);
}

.optolith-result {
  display: grid;
  gap: 1.5rem;
}

.optolith-result__header {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  justify-content: space-between;
  align-items: flex-start;
}

.optolith-result__title {
  margin-bottom: 0.25rem;
}

.optolith-result__meta {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(47, 36, 18, 0.7);
}

.optolith-result__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.optolith-callout__title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.optolith-callout__list {
  margin: 0;
  padding-left: 1.25rem;
  display: grid;
  gap: 0.45rem;
}

.optolith-details {
  border: 1px solid rgba(47, 36, 18, 0.16);
  border-radius: var(--aventuria-radius);
  background: rgba(255, 255, 255, 0.78);
  padding: 1rem 1.25rem;
}

.optolith-details + .optolith-details {
  margin-top: 0.75rem;
}

.optolith-details summary {
  cursor: pointer;
  font-weight: 700;
  color: rgba(47, 36, 18, 0.85);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.optolith-details__summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 1.5rem;
}

.optolith-details__summary-text {
  flex: 1;
}

.optolith-details summary:focus-visible {
  outline: 2px solid var(--aventuria-accent);
  outline-offset: 4px;
}

.optolith-details pre {
  margin: 0.85rem 0 0;
  padding: 1rem;
  border-radius: var(--aventuria-radius);
  background: rgba(47, 36, 18, 0.08);
  color: #251b0b;
  max-height: 20rem;
  overflow: auto;
  font-family:
    ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", "Courier New",
    monospace;
  font-size: 0.85rem;
  line-height: 1.6;
}

.optolith-json-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

.optolith-json-actions--history {
  margin-bottom: 0.35rem;
}

.optolith-json-actions__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border-radius: 999px;
}

.optolith-json-actions__icon {
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(47, 36, 18, 0.85);
}

.optolith-history {
  display: grid;
  gap: clamp(1rem, 2vw, 1.5rem);
}

.optolith-history__header {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
}

.optolith-history__empty {
  padding: clamp(0.75rem, 2vw, 1rem);
  border-radius: 0.75rem;
  background-color: rgba(47, 36, 18, 0.05);
  color: rgba(47, 36, 18, 0.75);
  font-weight: 500;
}

.optolith-history__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: clamp(0.75rem, 2vw, 1rem);
}

.optolith-history__item {
  display: grid;
  gap: clamp(0.5rem, 1.5vw, 0.75rem);
  border-radius: 0.75rem;
  border: 1px solid rgba(47, 36, 18, 0.12);
  padding: clamp(0.5rem, 1.5vw, 0.75rem);
  background: rgba(255, 255, 255, 0.9);
}

.optolith-history__toggle {
  display: grid;
  grid-template-columns: minmax(0, 2fr) auto auto auto;
  align-items: center;
  gap: clamp(0.5rem, 2vw, 1rem);
  width: 100%;
  background: transparent;
  border: none;
  padding: clamp(0.5rem, 1.5vw, 0.7rem) clamp(0.5rem, 1.5vw, 0.75rem);
  border-radius: 0.6rem;
  text-align: left;
  cursor: pointer;
  color: inherit;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.optolith-history__toggle:hover {
  background: rgba(47, 36, 18, 0.05);
}

.optolith-history__toggle:focus-visible {
  outline: 2px solid var(--aventuria-accent);
  outline-offset: 2px;
}

.optolith-history__toggle[aria-expanded="true"] {
  background: rgba(197, 143, 45, 0.14);
}

.optolith-history__toggle-name {
  font-size: clamp(1rem, 1.1vw, 1.1rem);
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.optolith-history__timestamp {
  margin: 0;
  color: rgba(47, 36, 18, 0.68);
  font-size: 0.9rem;
}

.optolith-history__warnings {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: rgba(47, 36, 18, 0.08);
  color: rgba(47, 36, 18, 0.75);
  font-size: 0.8rem;
  line-height: 1.2;
}

.optolith-history__warnings--has {
  background: rgba(179, 71, 62, 0.15);
  color: rgba(121, 34, 22, 0.95);
}

.optolith-history__chevron {
  display: inline-block;
  justify-self: flex-end;
  width: 0.75rem;
  height: 0.75rem;
  border-right: 2px solid rgba(47, 36, 18, 0.6);
  border-bottom: 2px solid rgba(47, 36, 18, 0.6);
  transform: rotate(-45deg);
  transition: transform 160ms ease;
}

.optolith-history__toggle[aria-expanded="true"] .optolith-history__chevron {
  transform: rotate(45deg);
}

.optolith-history__panel {
  display: grid;
  gap: clamp(0.6rem, 1.8vw, 0.9rem);
  padding: clamp(0.5rem, 1.5vw, 0.75rem);
  border-radius: 0.6rem;
  background: rgba(47, 36, 18, 0.04);
}

.optolith-history__panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-start;
}

.optolith-history__panel-content {
  display: grid;
  gap: clamp(0.75rem, 2vw, 1rem);
}

.optolith-history__section {
  display: grid;
  gap: 0.4rem;
}

.optolith-history__section-title {
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(47, 36, 18, 0.68);
}

.optolith-history__pre {
  margin: 0;
  padding: clamp(0.6rem, 1.5vw, 0.8rem);
  border-radius: 0.5rem;
  background: rgba(47, 36, 18, 0.05);
  max-height: 12rem;
  overflow: auto;
  font-family:
    ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", "Courier New",
    monospace;
  font-size: 0.84rem;
  line-height: 1.45;
}

. @media (max-width: 768px) {
  .optolith-result__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .optolith-result__actions {
    width: 100%;
  }

  .optolith-result__actions .aventuria-button {
    flex: 1 0 auto;
    justify-content: center;
  }

  .optolith-history__panel-actions {
    width: 100%;
    justify-content: stretch;
  }

  .optolith-history__panel-actions .aventuria-button {
    flex: 1 0 auto;
    justify-content: center;
  }

  .optolith-history__toggle {
    grid-template-columns: minmax(0, 1fr) auto;
    row-gap: 0.35rem;
  }

  .optolith-history__timestamp,
  .optolith-history__warnings {
    justify-self: flex-start;
  }
}
</style>
