import type { OptolithDatasetLookups, SelectOptionReference } from "./dataset";
import type { ResolutionResult } from "./resolver";
import type {
  AttributeKey,
  ParseResult,
} from "../../types/optolith/stat-block";

const DEFAULT_CLIENT_VERSION = "1.5.1";
const DEFAULT_PHASE = 3;
const DEFAULT_AP_TOTAL = 1100;
const EXPECTED_DATASET_SCHEMA_VERSION = "1.0.0";

const ATTRIBUTE_ID_MAP: Readonly<Record<string, string>> = {
  MU: "ATTR_1",
  KL: "ATTR_2",
  IN: "ATTR_3",
  CH: "ATTR_4",
  FF: "ATTR_5",
  GE: "ATTR_6",
  KO: "ATTR_7",
  KK: "ATTR_8",
};

export interface PoolValues {
  readonly lep: number | null;
  readonly asp: number | null;
  readonly kap: number | null;
  readonly ini: string | null;
  readonly aw: number | null;
  readonly sk: number | null;
  readonly zk: number | null;
  readonly gs: number | null;
}

export interface OptolithExport {
  readonly clientVersion: string;
  readonly dateCreated: string;
  readonly dateModified: string;
  readonly id: string;
  readonly phase: number;
  readonly locale: string;
  readonly name: string;
  readonly ap: {
    readonly total: number;
  };
  readonly attr: {
    readonly values: ReadonlyArray<{ id: string; value: number }>;
    readonly attributeAdjustmentSelected: string;
    readonly ae: number;
    readonly kp: number;
    readonly lp: number;
  };
  readonly pools: PoolValues;
  readonly activatable: Record<string, Array<Record<string, unknown>>>;
  readonly talents: Record<string, number>;
  readonly spells: Record<string, number>;
  readonly liturgies: Record<string, number>;
  readonly blessings: string[];
  readonly cantrips: string[];
  readonly rituals: Record<string, number>;
  readonly ct: Record<string, number>;
  readonly belongings: {
    readonly items: Record<string, unknown>;
    readonly armorZones: Record<string, unknown>;
    readonly purse: {
      readonly d: string;
      readonly s: string;
      readonly h: string;
      readonly k: string;
    };
  };
  readonly rules: {
    readonly higherParadeValues: number;
    readonly attributeValueLimit: boolean;
    readonly enableAllRuleBooks: boolean;
    readonly enabledRuleBooks: string[];
    readonly enableLanguageSpecializations: boolean;
  };
  readonly notes: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
}

export interface ExporterContext {
  readonly dataset: OptolithDatasetLookups;
  readonly parsed: ParseResult;
  readonly resolved: ResolutionResult;
}

export function exportToOptolithCharacter({
  dataset,
  parsed,
  resolved,
}: ExporterContext): OptolithExport {
  if (dataset.manifest.schemaVersion !== EXPECTED_DATASET_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported dataset schema version: ${dataset.manifest.schemaVersion}. Expected ${EXPECTED_DATASET_SCHEMA_VERSION}.`,
    );
  }

  const now = new Date().toISOString();
  const id = `NPC_${generateUuid()}`;

  const attributes = buildAttributes(parsed);
  const pools = buildPools(parsed);
  const activatable = buildActivatable(resolved);
  const talents = buildTalentRatings(resolved);
  const spells = buildRatedMap(resolved.spells);
  const liturgies = buildRatedMap(resolved.liturgies);
  const rituals = buildRatedMap(resolved.rituals);

  const warnings = createWarningMessages(parsed, resolved);

  return {
    clientVersion: DEFAULT_CLIENT_VERSION,
    dateCreated: now,
    dateModified: now,
    id,
    phase: DEFAULT_PHASE,
    locale: dataset.manifest.locale,
    name: resolved.name,
    ap: {
      total: DEFAULT_AP_TOTAL,
    },
    attr: attributes,
    pools,
    activatable,
    talents,
    spells,
    liturgies,
    blessings: buildBlessings(resolved),
    cantrips: [],
    rituals,
    ct: {},
    belongings: {
      items: {},
      armorZones: {},
      purse: {
        d: "0",
        s: "0",
        h: "0",
        k: "0",
      },
    },
    rules: {
      higherParadeValues: 0,
      attributeValueLimit: false,
      enableAllRuleBooks: true,
      enabledRuleBooks: [],
      enableLanguageSpecializations: false,
    },
    notes: Object.values(parsed.model.notes),
    warnings,
  };
}

function buildAttributes(parsed: ParseResult): OptolithExport["attr"] {
  const values = (
    Object.entries(ATTRIBUTE_ID_MAP) as Array<[AttributeKey, string]>
  )
    .map(([attributeKey, attributeId]) => {
      const raw = parsed.model.attributes[attributeKey] ?? 0;
      const attrValue = typeof raw === "number" ? raw : 0;
      return { id: attributeId, value: attrValue };
    })
    .sort((left, right) => left.id.localeCompare(right.id));

  return {
    values,
    attributeAdjustmentSelected: "ATTR_4",
    ae: 0,
    kp: 0,
    lp: 0,
  };
}

function buildPools(parsed: ParseResult): OptolithExport["pools"] {
  const { pools } = parsed.model;
  return {
    lep: pools.lep ?? null,
    asp: pools.asp ?? null,
    kap: pools.kap ?? null,
    ini: pools.ini ?? null,
    aw: pools.aw ?? null,
    sk: pools.sk ?? null,
    zk: pools.zk ?? null,
    gs: pools.gs ?? null,
  };
}

function buildActivatable(
  resolved: ResolutionResult,
): OptolithExport["activatable"] {
  const entries: Record<string, Array<Record<string, unknown>>> = {};

  const addInstance = (
    abilityId: string,
    instance: Record<string, unknown>,
  ) => {
    if (!entries[abilityId]) {
      entries[abilityId] = [];
    }
    entries[abilityId].push(instance);
  };

  const handleReference = (reference: {
    match?: { id: string };
    selectOption?: { id: number };
    level?: number;
  }) => {
    if (!reference.match) {
      return;
    }
    const instance: Record<string, unknown> = {};
    if (reference.selectOption) {
      instance.sid = reference.selectOption.id;
    }
    if (reference.level) {
      instance.tier = reference.level;
    }
    addInstance(reference.match.id, instance);
  };

  resolved.advantages.forEach(handleReference);
  resolved.disadvantages.forEach(handleReference);
  resolved.specialAbilities.forEach(handleReference);
  resolved.combatSpecialAbilities.forEach(handleReference);

  resolved.languages.forEach((language) => {
    if (!language.match) {
      return;
    }
    const instance: Record<string, unknown> = {};
    if (language.option) {
      instance.sid = language.option.optionId;
    }
    if (language.level) {
      instance.tier = language.level;
    }
    addInstance(language.match.id, instance);
  });

  return entries;
}

function buildTalentRatings(
  resolved: ResolutionResult,
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const talent of resolved.talents) {
    if (!talent.match) {
      continue;
    }
    map[talent.match.id] = talent.source.value;
  }
  return map;
}

function buildRatedMap(
  entries: ReadonlyArray<{ match?: { id: string }; value: number }>,
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const entry of entries) {
    if (!entry.match) {
      continue;
    }
    map[entry.match.id] = entry.value;
  }
  return map;
}

function buildBlessings(resolved: ResolutionResult): string[] {
  const blessings = new Set<string>();
  for (const entry of resolved.blessings) {
    if (entry.match) {
      blessings.add(entry.match.id);
    }
  }
  return Array.from(blessings);
}

function createWarningMessages(
  parsed: ParseResult,
  resolved: ResolutionResult,
): string[] {
  const warnings: string[] = [];
  for (const warning of parsed.warnings) {
    warnings.push(
      `[Parser] ${warning.section ?? "general"}: ${warning.message}`,
    );
  }
  for (const warning of resolved.warnings) {
    warnings.push(`[Resolver] ${warning.section}: ${warning.message}`);
  }
  for (const [section, values] of Object.entries(resolved.unresolved)) {
    for (const value of values) {
      warnings.push(`[Resolver] ${section}: unverarbeitet "${value}"`);
    }
  }
  return warnings;
}

export function describeSelectOption(option: SelectOptionReference): string {
  return `${option.name} (#${option.optionId})`;
}

function generateUuid(): string {
  const globalCrypto = (
    globalThis as { crypto?: { randomUUID?: () => string } }
  ).crypto;
  if (globalCrypto?.randomUUID) {
    return globalCrypto.randomUUID();
  }
  // RFC4122 v4 fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
