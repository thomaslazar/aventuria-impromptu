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
const DEFAULT_EXPERIENCE_LEVEL_ID = "EL_1";
const DEFAULT_RACE_ID = "R_1";
const DEFAULT_CULTURE_ID = "C_1";
const DEFAULT_PROFESSION_ID = "P_1";
const DEFAULT_RACE_VARIANT_ID: string | undefined = undefined;
const DEFAULT_PROFESSION_VARIANT_ID: string | undefined = undefined;
const DEFAULT_SEX = "m";
const DEFAULT_FAMILY_NAME = "Unbekannt";
const DEFAULT_PLACE_OF_BIRTH = "Unbekannt";
const DEFAULT_DATE_OF_BIRTH = "Unbekannt";
const DEFAULT_AGE = "Unbekannt";
const DEFAULT_SIZE = "Unbekannt";
const DEFAULT_WEIGHT = "Unbekannt";
const DEFAULT_SOCIAL_STATUS = 2;
const DEFAULT_CULTURE_KNOWLEDGE = "Unbekannt";

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

interface PermanentEnergy {
  readonly lost: number;
  readonly redeemed?: number;
}

interface AttributeBlock {
  readonly values: ReadonlyArray<{ id: string; value: number }>;
  readonly attributeAdjustmentSelected: string;
  readonly ae: number;
  readonly kp: number;
  readonly lp: number;
  readonly permanentAE: PermanentEnergy;
  readonly permanentKP: PermanentEnergy;
  readonly permanentLP: { readonly lost: number };
}

interface PersonalData {
  readonly family: string;
  readonly placeofbirth: string;
  readonly dateofbirth: string;
  readonly age: string;
  readonly size: string;
  readonly weight: string;
  readonly socialstatus: number;
  readonly cultureAreaKnowledge: string;
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
  readonly el: string;
  readonly r: string;
  readonly c: string;
  readonly p: string;
  readonly rv?: string;
  readonly pv?: string;
  readonly sex: string;
  readonly pers: PersonalData;
  readonly attr: AttributeBlock;
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
  readonly pets: Record<string, unknown>;
}

export interface ExportResult {
  readonly hero: OptolithExport;
  readonly warnings: readonly string[];
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
}: ExporterContext): ExportResult {
  if (dataset.manifest.schemaVersion !== EXPECTED_DATASET_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported dataset schema version: ${dataset.manifest.schemaVersion}. Expected ${EXPECTED_DATASET_SCHEMA_VERSION}.`,
    );
  }

  const now = new Date().toISOString();
  const id = generateHeroId();

  const attributes = buildAttributes(parsed);
  const activatable = buildActivatable(resolved);
  const talents = buildTalentRatings(resolved);
  const spells = buildRatedMap(resolved.spells);
  const liturgies = buildRatedMap(resolved.liturgies);
  const rituals = buildRatedMap(resolved.rituals);

  const hero: OptolithExport = {
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
    el: DEFAULT_EXPERIENCE_LEVEL_ID,
    r: DEFAULT_RACE_ID,
    c: DEFAULT_CULTURE_ID,
    p: DEFAULT_PROFESSION_ID,
    ...(DEFAULT_RACE_VARIANT_ID ? { rv: DEFAULT_RACE_VARIANT_ID } : {}),
    ...(DEFAULT_PROFESSION_VARIANT_ID
      ? { pv: DEFAULT_PROFESSION_VARIANT_ID }
      : {}),
    sex: inferSex(parsed),
    pers: buildPersonalData(parsed),
    attr: attributes,
    activatable,
    talents,
    spells,
    liturgies,
    blessings: buildBlessings(resolved),
    cantrips: buildCantrips(resolved),
    rituals,
    ct: {},
    belongings: buildBelongings(resolved),
    rules: buildRules(),
    pets: {},
  };

  const warnings = collectWarningMessages(parsed, resolved);

  return {
    hero,
    warnings,
  };
}

function inferSex(parsed: ParseResult): string {
  const normalizedName = parsed.model.name.trim().toLowerCase();
  const source = parsed.normalizedSource.toLowerCase();

  const femaleIndicators = [
    "kriegerin",
    "magierin",
    "priesterin",
    "jägerin",
    "herrin",
    "schamanin",
    "meisterin",
    "händlerin",
    "frau ",
  ];
  if (femaleIndicators.some((indicator) => source.includes(indicator))) {
    return "f";
  }

  const maleIndicators = ["schamane", "priester", "magier", "herr ", "krieger"];
  if (maleIndicators.some((indicator) => source.includes(indicator))) {
    return "m";
  }

  if (normalizedName.endsWith("in") || normalizedName.endsWith("a")) {
    return "f";
  }

  return DEFAULT_SEX;
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
    permanentAE: { lost: 0, redeemed: 0 },
    permanentKP: { lost: 0, redeemed: 0 },
    permanentLP: { lost: 0 },
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
    rawOption?: string;
  }) => {
    if (!reference.match) {
      return;
    }
    const instance: Record<string, unknown> = {};
    if (reference.selectOption) {
      instance.sid = reference.selectOption.id;
    }
    if (reference.rawOption && reference.rawOption.trim()) {
      instance.options = [
        {
          type: "Custom",
          value: reference.rawOption.trim(),
        },
      ];
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
    if (!language.option && language.rawOption?.trim()) {
      instance.options = [
        {
          type: "Custom",
          value: language.rawOption.trim(),
        },
      ];
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

function collectWarningMessages(
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
  resolved.weapons.forEach((weapon) => {
    if (!weapon.match && weapon.fallback !== "unarmed") {
      warnings.push(
        `[Exporter] weapons: Waffe "${weapon.source.name}" konnte nicht exportiert werden (keine Zuordnung).`,
      );
    }
  });
  if (resolved.armor && !resolved.armor.match) {
    const armorLabel =
      resolved.armor.source.description ??
      resolved.armor.source.notes ??
      resolved.armor.source.raw;
    warnings.push(
      `[Exporter] armor: Rüstung "${armorLabel}" konnte nicht exportiert werden (keine Zuordnung).`,
    );
  }
  return warnings;
}

function buildCantrips(resolved: ResolutionResult): string[] {
  return resolved.specialAbilities
    .filter((entry) => entry.match?.id.startsWith("CANTRIP_"))
    .map((entry) => entry.match!.id);
}

function buildRules(): OptolithExport["rules"] {
  return {
    higherParadeValues: 0,
    attributeValueLimit: false,
    enableAllRuleBooks: true,
    enabledRuleBooks: [],
    enableLanguageSpecializations: false,
  };
}

function buildPersonalData(parsed: ParseResult): PersonalData {
  void parsed;
  return {
    family: DEFAULT_FAMILY_NAME,
    placeofbirth: DEFAULT_PLACE_OF_BIRTH,
    dateofbirth: DEFAULT_DATE_OF_BIRTH,
    age: DEFAULT_AGE,
    size: DEFAULT_SIZE,
    weight: DEFAULT_WEIGHT,
    socialstatus: DEFAULT_SOCIAL_STATUS,
    cultureAreaKnowledge: DEFAULT_CULTURE_KNOWLEDGE,
  };
}

function buildBelongings(
  resolved: ResolutionResult,
): OptolithExport["belongings"] {
  const itemEntries: Array<Record<string, unknown>> = [];

  const addItem = (entry: Record<string, unknown>) => {
    itemEntries.push(entry);
  };

  resolved.weapons.forEach((weapon) => {
    if (!weapon.match) {
      return;
    }
    const item: Record<string, unknown> = {
      template: weapon.match.id,
      amount: 1,
      name: weapon.source.name,
    };
    if (weapon.combatTechnique?.id) {
      item.combatTechnique = weapon.combatTechnique.id;
    }
    addItem(item);
  });

  if (resolved.armor?.match) {
    const armorEntry: Record<string, unknown> = {
      template: resolved.armor.match.id,
      amount: 1,
      name:
        resolved.armor.source.description ??
        resolved.armor.source.notes ??
        resolved.armor.source.raw,
    };
    if (typeof resolved.armor.datasetProtection === "number") {
      armorEntry.pro = resolved.armor.datasetProtection;
    }
    if (typeof resolved.armor.datasetEncumbrance === "number") {
      armorEntry.enc = resolved.armor.datasetEncumbrance;
    }
    addItem(armorEntry);
  }

  resolved.equipment.forEach((entry) => {
    if (!entry.match) {
      return;
    }
    addItem({
      template: entry.match.id,
      amount: 1,
      name: entry.source,
    });
  });

  const items: Record<string, unknown> = {};
  itemEntries.forEach((item, index) => {
    items[`ITEM_${index + 1}`] = item;
  });

  return {
    items,
    armorZones: {},
    purse: {
      d: "0",
      s: "0",
      h: "0",
      k: "0",
    },
  };
}

export function describeSelectOption(option: SelectOptionReference): string {
  return `${option.name} (#${option.optionId})`;
}

function generateHeroId(): string {
  const random = Math.floor(1 + Math.random() * 9_000_000_000);
  return `H_${random}`;
}
