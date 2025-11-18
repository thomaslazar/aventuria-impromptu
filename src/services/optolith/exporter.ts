import type {
  DerivedLookup,
  OptolithDatasetLookups,
  SelectOptionReference,
} from "./dataset";
import type { DerivedEntity } from "../../types/optolith/manifest";
import type { ResolutionResult, ResolvedReference } from "./resolver";
import type {
  AttributeKey,
  ParseResult,
} from "../../types/optolith/stat-block";
import { deriveCombatTechniques } from "./combatTechniques";
import { normalizeLabel } from "../../utils/optolith/normalizer";

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

const ATTRIBUTE_ID_TO_KEY: Readonly<Record<string, AttributeKey>> = Object.fromEntries(
  Object.entries(ATTRIBUTE_ID_MAP).map(([key, id]) => [id, key as AttributeKey]),
) as Readonly<Record<string, AttributeKey>>;

const GEWEIHTER_ADVANTAGE_ID = "ADV_12";
const ZAUBERER_ADVANTAGE_ID = "ADV_50";
const HOHE_WEIHE_ABILITY_ID = "SA_563";
const GROSSE_MEDITATION_ABILITY_ID = "SA_772";
const HOHE_KARMALKRAFT_ADVANTAGE_ID = "ADV_24";
const HOHE_ASTRALKRAFT_ADVANTAGE_ID = "ADV_23";
const NIEDRIGE_KARMALKRAFT_DISADVANTAGE_ID = "DISADV_27";
const NIEDRIGE_ASTRALKRAFT_DISADVANTAGE_ID = "DISADV_26";
const ENERGY_PER_SPECIAL_ABILITY_LEVEL = 6;

const LINKED_OPTION_LOOKUP_RESOLVERS: Record<
  string,
  (dataset: OptolithDatasetLookups) => DerivedLookup
> = {
  Blessing: (dataset) => dataset.blessings,
  Cantrip: (dataset) => dataset.cantrips,
  LiturgicalChant: (dataset) => dataset.liturgies,
  Property: (dataset) => dataset.properties,
  Skill: (dataset) => dataset.skills,
  Spell: (dataset) => dataset.spells,
};

const LINKED_OPTION_PREFIX_MAP: Record<string, string> = {
  Blessing: "BLESSING",
  Cantrip: "CANTRIP",
  LiturgicalChant: "LITURGY",
  Property: "PROPERTY",
  Skill: "TAL",
  Spell: "SPELL",
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

  const attributes = buildAttributes(parsed, resolved, dataset);
  const activatable = buildActivatable(resolved, dataset);
  const talents = buildTalentRatings(resolved);
  const spells = buildRatedMap(resolved.spells);
  const liturgies = buildRatedMap(resolved.liturgies);
  const rituals = buildRatedMap(resolved.rituals);

  const ctResult = deriveCombatTechniques(parsed, resolved, dataset);

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
    ct: ctResult.values,
    belongings: buildBelongings(resolved),
    rules: buildRules(),
    pets: {},
  };

  const warnings = collectWarningMessages(parsed, resolved, ctResult.warnings);

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

function buildAttributes(
  parsed: ParseResult,
  resolved: ResolutionResult,
  dataset: OptolithDatasetLookups,
): OptolithExport["attr"] {
  const values = (
    Object.entries(ATTRIBUTE_ID_MAP) as Array<[AttributeKey, string]>
  )
    .map(([attributeKey, attributeId]) => {
      const raw = parsed.model.attributes[attributeKey] ?? 0;
      const attrValue = typeof raw === "number" ? raw : 0;
      return { id: attributeId, value: attrValue };
    })
    .sort((left, right) => left.id.localeCompare(right.id));

  const extraKarma = computeAdditionalKarmaEnergy(parsed, resolved, dataset);
  const extraAstral = computeAdditionalAstralEnergy(parsed, resolved, dataset);

  return {
    values,
    attributeAdjustmentSelected: "ATTR_4",
    ae: extraAstral,
    kp: extraKarma,
    lp: 0,
    permanentAE: { lost: 0, redeemed: 0 },
    permanentKP: { lost: 0, redeemed: 0 },
    permanentLP: { lost: 0 },
  };
}

function computeAdditionalKarmaEnergy(
  parsed: ParseResult,
  resolved: ResolutionResult,
  dataset: OptolithDatasetLookups,
): number {
  const poolValue = parsed.model.pools.kap;
  if (typeof poolValue !== "number" || poolValue <= 0) {
    return 0;
  }
  if (!hasAdvantage(resolved, GEWEIHTER_ADVANTAGE_ID)) {
    return 0;
  }
  const tradition = findTraditionEntry(
    resolved,
    dataset.blessedTraditions,
  );
  if (!tradition) {
    return 0;
  }
  const primaryAttributeId = getPrimaryAttributeId(tradition);
  const primaryValue = getAttributeValueFromId(parsed, primaryAttributeId);
  if (primaryValue === null) {
    return 0;
  }
  const hoheWeiheLevel = getAbilityLevel(
    resolved.specialAbilities,
    HOHE_WEIHE_ABILITY_ID,
  );
  const hoheKarmaLevel = getAdvantageLevel(
    resolved.advantages,
    HOHE_KARMALKRAFT_ADVANTAGE_ID,
  );
  const niedrigeKarmaLevel = getDisadvantageLevel(
    resolved.disadvantages,
    NIEDRIGE_KARMALKRAFT_DISADVANTAGE_ID,
  );
  const base =
    20 +
    primaryValue +
    hoheWeiheLevel * ENERGY_PER_SPECIAL_ABILITY_LEVEL +
    hoheKarmaLevel -
    niedrigeKarmaLevel;
  const extra = poolValue - base;
  return extra > 0 ? extra : 0;
}

function computeAdditionalAstralEnergy(
  parsed: ParseResult,
  resolved: ResolutionResult,
  dataset: OptolithDatasetLookups,
): number {
  const poolValue = parsed.model.pools.asp;
  if (typeof poolValue !== "number" || poolValue <= 0) {
    return 0;
  }
  if (!hasAdvantage(resolved, ZAUBERER_ADVANTAGE_ID)) {
    return 0;
  }
  const tradition = findTraditionEntry(
    resolved,
    dataset.magicalTraditions,
  );
  if (!tradition) {
    return 0;
  }
  const primaryAttributeId = getPrimaryAttributeId(tradition);
  const primaryValue = getAttributeValueFromId(parsed, primaryAttributeId);
  if (primaryValue === null) {
    return 0;
  }
  const meditationLevel = getAbilityLevel(
    resolved.specialAbilities,
    GROSSE_MEDITATION_ABILITY_ID,
  );
  const hoheAstralLevel = getAdvantageLevel(
    resolved.advantages,
    HOHE_ASTRALKRAFT_ADVANTAGE_ID,
  );
  const niedrigeAstralLevel = getDisadvantageLevel(
    resolved.disadvantages,
    NIEDRIGE_ASTRALKRAFT_DISADVANTAGE_ID,
  );
  const base =
    20 +
    primaryValue +
    meditationLevel * ENERGY_PER_SPECIAL_ABILITY_LEVEL +
    hoheAstralLevel -
    niedrigeAstralLevel;
  const extra = poolValue - base;
  return extra > 0 ? extra : 0;
}

function hasAdvantage(
  resolved: ResolutionResult,
  advantageId: string,
): boolean {
  return resolved.advantages.some((entry) => entry.match?.id === advantageId);
}

function getAdvantageLevel(
  entries: readonly ResolvedReference[],
  advantageId: string,
): number {
  const entry = entries.find((candidate) => candidate.match?.id === advantageId);
  return entry?.level ?? 0;
}

function getDisadvantageLevel(
  entries: readonly ResolvedReference[],
  disadvantageId: string,
): number {
  const entry = entries.find(
    (candidate) => candidate.match?.id === disadvantageId,
  );
  return entry?.level ?? 0;
}

function findTraditionEntry(
  resolved: ResolutionResult,
  traditions: Map<string, DerivedEntity>,
): DerivedEntity | undefined {
  for (const entry of resolved.specialAbilities) {
    const match = entry.match;
    if (match && traditions.has(match.id)) {
      return traditions.get(match.id);
    }
  }
  return undefined;
}

function getPrimaryAttributeId(entry?: DerivedEntity): string | undefined {
  if (!entry) {
    return undefined;
  }
  const base = entry.base as { primary?: string } | undefined;
  return typeof base?.primary === "string" ? base.primary : undefined;
}

function getAttributeValueFromId(
  parsed: ParseResult,
  attributeId?: string,
): number | null {
  if (!attributeId) {
    return null;
  }
  const attributeKey = ATTRIBUTE_ID_TO_KEY[attributeId];
  if (!attributeKey) {
    return null;
  }
  const value = parsed.model.attributes[attributeKey];
  return typeof value === "number" ? value : null;
}

function getAbilityLevel(
  entries: readonly { match?: DerivedEntity; level?: number }[],
  abilityId: string,
): number {
  const ability = entries.find((entry) => entry.match?.id === abilityId);
  return ability?.level ?? 0;
}

function extractDetailLabel(reference: {
  rawOption?: string;
  source?: string;
}): string | undefined {
  const raw = reference.rawOption?.trim();
  if (raw && raw.length > 0) {
    return raw;
  }
  const match = reference.source?.match(/\(([^)]+)\)/);
  const extracted = match?.[1]?.trim();
  return extracted && extracted.length > 0 ? extracted : undefined;
}

function buildSpecialActivatableInstance(
  reference: {
    match?: DerivedEntity;
    level?: number;
    rawOption?: string;
    source?: string;
    linkedOption?: { type: string; value: number };
  },
  dataset: OptolithDatasetLookups,
): Record<string, unknown> | undefined {
  if (!reference.match) {
    return undefined;
  }
  const normalizedName = reference.match.normalizedName;
  const detail = extractDetailLabel(reference);

  if (
    normalizedName === "korperliche auffalligkeit" ||
    normalizedName === "schlechte angewohnheit" ||
    normalizedName === "prinzipientreue"
  ) {
    const instance: Record<string, unknown> = {
      ...(detail ? { sid: detail } : {}),
    };
    if (reference.level) {
      instance.tier = reference.level;
    }
    return instance;
  }

  if (normalizedName === "ortskenntnis" && detail) {
    const instance: Record<string, unknown> = { sid: detail };
    if (reference.level) {
      instance.tier = reference.level;
    }
    return instance;
  }

  if (normalizedName === "fertigkeitsspezialisierung") {
    const specialization = buildSkillSpecializationInstance(
      detail,
      reference.level,
      dataset,
    );
    if (specialization) {
      return specialization;
    }
  }

  if (
    normalizedName === "lieblingsliturgie" &&
    reference.linkedOption
  ) {
    const sid = mapLinkedOptionToSid(reference.linkedOption, dataset);
    if (sid) {
      const instance: Record<string, unknown> = { sid };
      if (reference.level) {
        instance.tier = reference.level;
      }
      return instance;
    }
  }

  return undefined;
}

function buildSkillSpecializationInstance(
  detail: string | undefined,
  level: number | undefined,
  dataset: OptolithDatasetLookups,
): Record<string, unknown> | undefined {
  if (!detail) {
    return undefined;
  }
  const specialization = parseSkillSpecializationDetail(detail);
  if (!specialization?.skillName) {
    return undefined;
  }
  const normalizedSkill = normalizeLabel(specialization.skillName);
  if (!normalizedSkill) {
    return undefined;
  }
  const skill = dataset.skills.byName.get(normalizedSkill);
  if (!skill) {
    return undefined;
  }
  const instance: Record<string, unknown> = {
    sid: skill.id,
  };
  if (specialization.applicationName) {
    const applicationId = findSkillApplicationId(
      skill,
      specialization.applicationName,
    );
    if (applicationId !== undefined) {
      instance.sid2 = applicationId;
    }
  }
  if (level) {
    instance.tier = level;
  }
  return instance;
}

function parseSkillSpecializationDetail(detail: string): {
  skillName: string;
  applicationName?: string;
} | undefined {
  const normalizedDetail = detail.trim();
  if (!normalizedDetail) {
    return undefined;
  }
  const colonIndex = normalizedDetail.indexOf(":");
  if (colonIndex >= 0) {
    return {
      skillName: normalizedDetail.slice(0, colonIndex).trim(),
      applicationName: normalizedDetail.slice(colonIndex + 1).trim(),
    };
  }
  const dashMatch = normalizedDetail.match(/^(.*?)\s*[–-]\s*(.+)$/u);
  if (dashMatch && dashMatch[1] && dashMatch[2]) {
    return {
      skillName: dashMatch[1].trim(),
      applicationName: dashMatch[2].trim(),
    };
  }
  const parenMatch = normalizedDetail.match(/^(.*?)\s*\((.+)\)$/u);
  if (parenMatch && parenMatch[1]) {
    return {
      skillName: parenMatch[1].trim(),
      applicationName: parenMatch[2]?.trim(),
    };
  }
  return {
    skillName: normalizedDetail,
  };
}

function findSkillApplicationId(
  skill: DerivedEntity,
  applicationName: string,
): number | undefined {
  const locale = skill.locale as {
    applications?: ReadonlyArray<{ id?: number; name?: string }>;
  };
  const applications = Array.isArray(locale?.applications)
    ? locale!.applications
    : [];
  const normalizedApplication = normalizeLabel(applicationName);
  if (!normalizedApplication) {
    return undefined;
  }
  for (const entry of applications) {
    if (typeof entry?.id !== "number" || typeof entry?.name !== "string") {
      continue;
    }
    const normalized = normalizeLabel(entry.name);
    if (normalized && normalized === normalizedApplication) {
      return entry.id;
    }
  }
  return undefined;
}

function mapLinkedOptionToSid(
  linkedOption: { type: string; value: number },
  dataset: OptolithDatasetLookups,
): string | undefined {
  const resolver = LINKED_OPTION_LOOKUP_RESOLVERS[linkedOption.type];
  if (!resolver) {
    return undefined;
  }
  const lookup = resolver(dataset);
  const prefix = LINKED_OPTION_PREFIX_MAP[linkedOption.type];
  if (prefix) {
    const candidateId = `${prefix}_${linkedOption.value}`;
    const direct = lookup.byId.get(candidateId);
    if (direct) {
      return direct.id;
    }
  }
  for (const entry of lookup.byId.values()) {
    if (extractNumericId(entry.id) === linkedOption.value) {
      return entry.id;
    }
  }
  return undefined;
}

function extractNumericId(id: string): number | undefined {
  const match = id.match(/_(\d+)$/);
  if (!match) {
    return undefined;
  }
  const value = Number.parseInt(match[1] ?? "", 10);
  return Number.isNaN(value) ? undefined : value;
}

function extractPrincipleName(reference: {
  rawOption?: string;
  source?: string;
}): string | undefined {
  const raw = reference.rawOption?.trim();
  if (raw && raw.length > 0) {
    return raw;
  }
  const match = reference.source?.match(/\(([^)]+)\)/);
  const extracted = match?.[1]?.trim();
  return extracted && extracted.length > 0 ? extracted : undefined;
}

function buildActivatable(
  resolved: ResolutionResult,
  dataset: OptolithDatasetLookups,
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
    match?: DerivedEntity;
    selectOption?: { id: number };
    level?: number;
    rawOption?: string;
    source?: string;
    linkedOption?: { type: string; value: number };
  }) => {
    if (!reference.match) {
      return;
    }

    const specialInstance = buildSpecialActivatableInstance(
      reference,
      dataset,
    );
    if (specialInstance) {
      addInstance(reference.match.id, specialInstance);
      return;
    }

    const instance: Record<string, unknown> = {};
    if (reference.match.normalizedName === "prinzipientreue") {
      const principleName = extractPrincipleName(reference);
      if (principleName) {
        instance.sid = principleName;
      }
      if (reference.level) {
        instance.tier = reference.level;
      }
      addInstance(reference.match.id, instance);
      return;
    }
    if (reference.selectOption) {
      instance.sid = reference.selectOption.id;
    }
    if (reference.linkedOption) {
      instance.options = [
        {
          type: "Predefined",
          id: reference.linkedOption,
        },
      ];
    } else if (reference.rawOption && reference.rawOption.trim()) {
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
    if (reference.source) {
      instance.label = reference.source;
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
    instance.label = language.source;
    addInstance(language.match.id, instance);
  });

  resolved.scripts?.forEach((script) => {
    if (!script.match) {
      return;
    }
    const instance: Record<string, unknown> = {};
    if (script.option) {
      instance.sid = script.option.optionId;
    }
    if (!script.option && script.rawOption?.trim()) {
      instance.options = [
        {
          type: "Custom",
          value: script.rawOption.trim(),
        },
      ];
    }
    instance.label = script.source;
    addInstance(script.match.id, instance);
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
  additional: readonly string[] = [],
): string[] {
  const warnings: string[] = [];
  const seen = new Set<string>();
  const pushUnique = (message: string) => {
    if (seen.has(message)) {
      return;
    }
    seen.add(message);
    warnings.push(message);
  };
  for (const warning of parsed.warnings) {
    pushUnique(`[Parser] ${warning.section ?? "general"}: ${warning.message}`);
  }
  for (const warning of resolved.warnings) {
    pushUnique(`[Resolver] ${warning.section}: ${warning.message}`);
  }
  for (const [section, values] of Object.entries(resolved.unresolved)) {
    for (const value of values) {
      pushUnique(`[Resolver] ${section}: unverarbeitet "${value}"`);
    }
  }
  resolved.weapons.forEach((weapon) => {
    if (!weapon.match && weapon.fallback !== "unarmed") {
      pushUnique(
        `[Exporter] weapons: Waffe "${weapon.source.name}" konnte nicht exportiert werden (keine Zuordnung).`,
      );
    }
  });
  if (
    resolved.armor &&
    !resolved.armor.match &&
    !resolved.armor.isNaturalArmor
  ) {
    const armorLabel =
      resolved.armor.source.description ??
      resolved.armor.source.notes ??
      resolved.armor.source.raw;
    pushUnique(
      `[Exporter] armor: Rüstung "${armorLabel}" konnte nicht exportiert werden (keine Zuordnung).`,
    );
  }
  additional.forEach((message) => pushUnique(message));
  return warnings;
}

function buildCantrips(resolved: ResolutionResult): string[] {
  return resolved.cantrips
    .filter((entry) => Boolean(entry.match?.id))
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
    const hydrated = hydrateTemplateItem(weapon.match, {
      name: weapon.source.name,
    });
    if (weapon.combatTechnique?.id) {
      hydrated.combatTechnique = weapon.combatTechnique.id;
    }
    addItem(hydrated);
  });

  if (resolved.armor?.match) {
    addItem(
      hydrateTemplateItem(resolved.armor.match, {
        name:
          resolved.armor.source.description ??
          resolved.armor.source.notes ??
          resolved.armor.source.raw ??
          resolved.armor.match.name,
      }),
    );
  }

  resolved.equipment.forEach((entry) => {
    if (!entry.match) {
      return;
    }
    const quantity = entry.quantityHint ?? extractItemQuantity(entry.source);
    const overrides: Record<string, unknown> = {
      name: entry.source,
    };
    if (typeof quantity === "number") {
      overrides.amount = quantity;
    }
    addItem(hydrateTemplateItem(entry.match, overrides));
  });

  const items: Record<string, unknown> = {};
  itemEntries.forEach((item, index) => {
    const itemId = `ITEM_${index + 1}`;
    items[itemId] = {
      id: itemId,
      ...item,
    };
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

function extractItemQuantity(source: string): number | undefined {
  const match = source.match(
    /\((\d+)\s*(?:m|meter|metern|schritte?|schritt)\s*\)$/i,
  );
  if (match?.[1]) {
    const quantity = Number.parseInt(match[1], 10);
    return Number.isNaN(quantity) ? undefined : quantity;
  }
  return undefined;
}

function hydrateTemplateItem(
  match: DerivedEntity,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const base = (match.base ?? {}) as Record<string, unknown>;
  const special = (base.special ?? {}) as Record<string, unknown>;
  const hydrated: Record<string, unknown> = {
    template: match.id,
    amount: 1,
    name: match.name,
    isTemplateLocked: true,
    ...overrides,
  };

  for (const [key, value] of Object.entries(base)) {
    if (key === "special" || key === "id" || value === undefined) {
      continue;
    }
    hydrated[key] = value;
  }

  const rangeParts: { close?: number; medium?: number; far?: number } = {};
  for (const [key, value] of Object.entries(special ?? {})) {
    if (value === undefined || value === null) {
      continue;
    }
    switch (key) {
      case "protection":
        hydrated.pro = value;
        break;
      case "encumbrance":
        hydrated.enc = value;
        break;
      case "closeRange":
        rangeParts.close = Number(value);
        break;
      case "mediumRange":
        rangeParts.medium = Number(value);
        break;
      case "farRange":
        rangeParts.far = Number(value);
        break;
      default:
        hydrated[key] = value;
        break;
    }
  }

  const rangeValues = [
    rangeParts.close,
    rangeParts.medium,
    rangeParts.far,
  ].filter(
    (part): part is number => typeof part === "number" && Number.isFinite(part),
  );
  if (rangeValues.length > 0) {
    hydrated.range = rangeValues;
  }

  if (overrides.name) {
    hydrated.name = overrides.name;
  } else {
    hydrated.name = match.name;
  }
  if (overrides.amount) {
    hydrated.amount = overrides.amount;
  }

  return hydrated;
}

export function describeSelectOption(option: SelectOptionReference): string {
  return `${option.name} (#${option.optionId})`;
}

function generateHeroId(): string {
  const random = Math.floor(1 + Math.random() * 9_000_000_000);
  return `H_${random}`;
}
