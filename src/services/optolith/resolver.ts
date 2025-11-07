import type {
  DerivedLookup,
  OptolithDatasetLookups,
  SelectOptionReference,
} from "./dataset";
import type {
  ArmorStats,
  ParsedStatBlock,
  RatedEntry,
  TalentRating,
  WeaponStats,
} from "../../types/optolith/stat-block";
import type { DerivedEntity } from "../../types/optolith/manifest";
import { normalizeLabel } from "../../utils/optolith/normalizer";

export interface ResolvedReference {
  readonly source: string;
  readonly normalizedSource: string;
  readonly match?: DerivedEntity;
  readonly selectOption?: {
    readonly id: number;
    readonly name: string;
  };
  readonly level?: number;
  readonly rawOption?: string;
}

export interface ResolvedLanguage extends ResolvedReference {
  readonly option?: SelectOptionReference;
  readonly level?: number;
}

export interface ResolvedTalent {
  readonly source: TalentRating;
  readonly match?: DerivedEntity;
}

export interface ResolvedRatedReference extends ResolvedReference {
  readonly value: number;
}

export interface ResolvedWeapon {
  readonly source: WeaponStats;
  readonly normalizedSource: string;
  readonly match?: DerivedEntity;
  readonly combatTechnique?: DerivedEntity;
  readonly fallback?: "unarmed";
}

export interface ResolvedArmor {
  readonly source: ArmorStats;
  readonly normalizedSource?: string;
  readonly match?: DerivedEntity;
  readonly datasetProtection?: number | null;
  readonly datasetEncumbrance?: number | null;
  readonly isNaturalArmor?: boolean;
}

export interface ResolutionWarning {
  readonly type:
    | "unresolved"
    | "level-out-of-range"
    | "unresolved-option"
    | "fuzzy-match"
    | "value-mismatch";
  readonly section: string;
  readonly value: string;
  readonly message: string;
}

const ADV_DISADV_BASE_ALIASES: Record<string, string> = {
  "schlechte eigenschaften": "Schlechte Eigenschaft",
  "schlechte eigenschaft": "Schlechte Eigenschaft",
  dammerungssicht: "Dunkelsicht",
  dammersicht: "Dunkelsicht",
  dunkesicht: "Dunkelsicht",
  verpflichtung: "Verpflichtungen",
  personlichkeitsschwache: "Persönlichkeitsschwächen",
  personlichkeitsschwachen: "Persönlichkeitsschwächen",
};

const CITATION_PATTERN = /AKO(?:[IVXLCDM]+)?\s*\d{1,4}/g;
const TRAILING_DELIMITER_PATTERN = /[,:;]+$/;

const EQUIPMENT_KEYWORD_FALLBACKS: Record<string, string> = {
  peitsche: "fuhrmannspeitsche",
  speer: "speer",
  schwert: "langschwert",
  langschild: "gro schild",
  schild: "holzschild",
  dolch: "dolch",
  krummsabel: "sabel",
  krummsaebel: "sabel",
  platte: "plattenrustung",
};

const LOAD_ADAPTATION_NORMALIZED_NAME = "belastungsgewohnung";

const PERSONALITY_WEAKNESS_OPTIONS = [
  "Arroganz",
  "Eitelkeit",
  "Neid",
  "Streitsucht",
  "Unheimlich",
  "Verwöhnt",
  "Vorurteile",
  "Weltfremd",
  "Anzügliches Verhalten",
  "Eifersucht",
  "Busenkomplexe",
  "Peniskomplexe",
  "Stimmungsschwankungen",
];

const NUMBER_WORDS = new Set(
  [
    "ein",
    "eine",
    "einen",
    "einem",
    "einer",
    "eins",
    "zwei",
    "drei",
    "vier",
    "fünf",
    "sechs",
    "sieben",
    "acht",
    "neun",
    "zehn",
    "elf",
    "zwölf",
  ].map((value) => value.toLowerCase()),
);

export interface ResolutionResult {
  readonly name: string;
  readonly advantages: readonly ResolvedReference[];
  readonly disadvantages: readonly ResolvedReference[];
  readonly specialAbilities: readonly ResolvedReference[];
  readonly combatSpecialAbilities: readonly ResolvedReference[];
  readonly languages: readonly ResolvedLanguage[];
  readonly talents: readonly ResolvedTalent[];
  readonly spells: readonly ResolvedRatedReference[];
  readonly liturgies: readonly ResolvedRatedReference[];
  readonly rituals: readonly ResolvedRatedReference[];
  readonly blessings: readonly ResolvedReference[];
  readonly equipment: readonly ResolvedReference[];
  readonly weapons: readonly ResolvedWeapon[];
  readonly armor: ResolvedArmor | null;
  readonly unresolved: Readonly<Record<string, readonly string[]>>;
  readonly warnings: readonly ResolutionWarning[];
}

interface ResolutionContext {
  readonly lookups: OptolithDatasetLookups;
  readonly warnings: ResolutionWarning[];
  readonly unresolved: Map<string, Set<string>>;
  readonly warningKeys: Set<string>;
}

export function resolveStatBlock(
  statBlock: ParsedStatBlock,
  lookups: OptolithDatasetLookups,
): ResolutionResult {
  const context: ResolutionContext = {
    lookups,
    warnings: [],
    unresolved: new Map(),
    warningKeys: new Set(),
  };

  const normalizedAdvDisadv = normalizeAdvantageDisadvantageLists(
    statBlock,
    lookups,
  );
  const languageAccumulator = new Set(normalizedAdvDisadv.languages);

  const specialAbilityEntries = extractLanguageEntries(
    [
      ...statBlock.specialAbilities,
      ...extractSpecialAbilitiesFromNotes(statBlock.notes),
    ],
    languageAccumulator,
    lookups,
  );
  const combatSpecialAbilityEntries = extractLanguageEntries(
    statBlock.combatSpecialAbilities,
    languageAccumulator,
    lookups,
  );

  const advantages = resolveSection(
    normalizedAdvDisadv.advantages,
    "advantages",
    context.lookups.advantages,
    context,
  );
  const disadvantages = resolveSection(
    normalizedAdvDisadv.disadvantages,
    "disadvantages",
    context.lookups.disadvantages,
    context,
  );

  const specialAbilities = resolveSection(
    specialAbilityEntries,
    "specialAbilities",
    context.lookups.specialAbilities,
    context,
  );
  const combatSpecialAbilities = resolveSection(
    combatSpecialAbilityEntries,
    "combatSpecialAbilities",
    context.lookups.specialAbilities,
    context,
  );

  const allLanguages = [...statBlock.languages, ...languageAccumulator];
  const languages = resolveLanguages(allLanguages, context);

  const talents = resolveTalents(statBlock.talents, context);
  const spells = resolveRatedSection(
    statBlock.spells,
    "spells",
    context.lookups.spells,
    context,
  );
  const liturgies = resolveRatedSection(
    statBlock.liturgies,
    "liturgies",
    context.lookups.liturgies,
    context,
  );
  const rituals = resolveRatedSection(
    statBlock.rituals,
    "rituals",
    context.lookups.spells,
    context,
  );
  const blessings = resolveSection(
    statBlock.blessings,
    "blessings",
    context.lookups.blessings,
    context,
  );
  const equipment = resolveSection(
    statBlock.equipment,
    "equipment",
    context.lookups.equipment,
    context,
  );

  const loadAdaptationLevel = getLoadAdaptationLevel(specialAbilities);
  const weapons = resolveWeapons(statBlock.weapons, context);
  const armor = resolveArmor(
    statBlock.armor ?? null,
    context,
    loadAdaptationLevel,
  );

  const unresolvedRecord: Record<string, readonly string[]> = {};
  for (const [section, values] of context.unresolved.entries()) {
    unresolvedRecord[section] = Array.from(values.values());
  }

  return {
    name: statBlock.name,
    advantages,
    disadvantages,
    specialAbilities,
    combatSpecialAbilities,
    languages,
    talents,
    spells,
    liturgies,
    rituals,
    blessings,
    equipment,
    weapons,
    armor,
    unresolved: unresolvedRecord,
    warnings: context.warnings,
  };
}

function resolveSection(
  values: readonly string[],
  section: string,
  lookup: { byName: Map<string, DerivedEntity> },
  context: ResolutionContext,
): ResolvedReference[] {
  return values
    .map((raw) => sanitizeResolvableValue(raw))
    .filter((value) => value.length > 0)
    .map((value) => {
      const components = parseEntryComponents(value);
      let normalized = normalizeLabel(components.baseName);
      let match = lookup.byName.get(normalized);
      let usedOptionForNormalization: string | undefined;
      let selectOption: { id: number; name: string } | undefined;
      let rawOption: string | undefined;
      let optionNameForLabel: string | undefined;

      if (!match && components.options.length > 0) {
        for (const candidate of components.options) {
          const candidateName = `${components.baseName} (${candidate})`;
          const candidateNormalized = normalizeLabel(candidateName);
          const candidateMatch = lookup.byName.get(candidateNormalized);
          if (candidateMatch) {
            match = candidateMatch;
            normalized = candidateNormalized;
            usedOptionForNormalization = candidate;
            break;
          }
        }
      }

      if (match && hasSelectOptions(match) && components.options.length > 0) {
        for (const candidate of components.options) {
          const option = findSelectOption(match, candidate);
          if (option) {
            selectOption = option;
            optionNameForLabel = option.name;
            break;
          }
          if (!rawOption) {
            rawOption = candidate;
          }
        }
      } else if (components.options.length > 0) {
        optionNameForLabel =
          usedOptionForNormalization ?? components.options[0];
      }

      if (!optionNameForLabel && components.options.length > 0) {
        optionNameForLabel =
          usedOptionForNormalization ?? components.options[0];
      }

      if (!optionNameForLabel && usedOptionForNormalization) {
        optionNameForLabel = usedOptionForNormalization;
      }

      if (!match && section === "equipment") {
        const fallbackMatch = resolveEquipmentFallbackMatch(
          value,
          "equipment",
          context,
          components.options,
        );
        if (fallbackMatch) {
          match = fallbackMatch;
        }
      }

      const sourceLabel = buildResolvedLabel(
        components.baseName,
        components.level,
        optionNameForLabel,
      );

      if (
        !match &&
        section === "blessings" &&
        isStandardBlessingsAggregate(sourceLabel)
      ) {
        return {
          source: sourceLabel,
          normalizedSource: normalized,
          match: undefined,
          selectOption,
          level: components.level ?? undefined,
          rawOption,
        };
      }

      if (!match) {
        registerUnresolved(section, sourceLabel, context);
      }
      return {
        source: sourceLabel,
        normalizedSource: normalized,
        match,
        selectOption,
        level: components.level ?? undefined,
        rawOption,
      };
    });
}

function resolveRatedSection(
  entries: readonly RatedEntry[],
  section: string,
  lookup: { byName: Map<string, DerivedEntity> },
  context: ResolutionContext,
): ResolvedRatedReference[] {
  const results: ResolvedRatedReference[] = [];
  for (const entry of entries) {
    const sanitizedName = sanitizeResolvableValue(entry.name);
    if (!sanitizedName) {
      registerUnresolved(section, entry.name, context);
      continue;
    }
    const normalized = normalizeLabel(sanitizedName);
    const match = lookup.byName.get(normalized);
    if (!match) {
      registerUnresolved(section, sanitizedName, context);
    }
    results.push({
      source: sanitizedName,
      normalizedSource: normalized,
      match,
      value: entry.value,
    });
  }
  return results;
}

function resolveTalents(
  talents: readonly TalentRating[],
  context: ResolutionContext,
): ResolvedTalent[] {
  return talents.map((talent) => {
    const normalized = normalizeLabel(talent.name);
    let match = context.lookups.skills.byName.get(normalized);
    if (!match) {
      const fuzzy = findNearestLookupEntry(
        normalized,
        context.lookups.skills.byName,
        1,
      );
      if (fuzzy) {
        match = fuzzy.entry;
        pushWarning(
          {
            type: "fuzzy-match",
            section: "talents",
            value: talent.name,
            message: `Talent "${talent.name}" wurde als "${match.name}" interpretiert (Schreibweise korrigiert).`,
          },
          context,
        );
      } else {
        registerUnresolved("talents", talent.name, context);
      }
    }
    return {
      source: talent,
      match,
    };
  });
}

function getLoadAdaptationLevel(
  specialAbilities: readonly ResolvedReference[],
): number {
  let level = 0;
  for (const ability of specialAbilities) {
    if (ability.match?.normalizedName !== LOAD_ADAPTATION_NORMALIZED_NAME) {
      continue;
    }
    const abilityLevel = ability.level ?? 1;
    if (abilityLevel > level) {
      level = abilityLevel;
    }
  }
  return level;
}

function resolveWeapons(
  weapons: readonly WeaponStats[],
  context: ResolutionContext,
): ResolvedWeapon[] {
  const results: ResolvedWeapon[] = [];
  for (const weapon of weapons) {
    const sanitizedName = sanitizeResolvableValue(weapon.name);
    const normalized = normalizeLabel(
      sanitizedName.length > 0 ? sanitizedName : weapon.name,
    );
    const isUnarmed =
      weapon.category === "unarmed" || normalized === "waffenlos";

    let match =
      normalized.length > 0
        ? context.lookups.equipment.byName.get(normalized)
        : undefined;
    let combatTechnique: DerivedEntity | undefined;
    let fallback: ResolvedWeapon["fallback"];

    if (!match) {
      match = resolveEquipmentFallbackMatch(weapon.name, "weapons", context);
    }

    if (!match && isUnarmed) {
      fallback = "unarmed";
      combatTechnique = context.lookups.combatTechniques.byId.get("CT_9");
      if (!combatTechnique) {
        pushWarning(
          {
            type: "unresolved",
            section: "combatTechniques",
            value: "CT_9",
            message: "Kampftechnik Raufen (CT_9) konnte nicht geladen werden.",
          },
          context,
        );
      }
    }

    if (match) {
      const combatTechniqueId = extractCombatTechniqueId(match);
      if (combatTechniqueId) {
        combatTechnique =
          context.lookups.combatTechniques.byId.get(combatTechniqueId);
        if (!combatTechnique) {
          pushWarning(
            {
              type: "unresolved",
              section: "combatTechniques",
              value: combatTechniqueId,
              message: `Kampftechnik-ID "${combatTechniqueId}" fehlt im Datensatz (für ${weapon.name}).`,
            },
            context,
          );
        }
      } else if (!fallback) {
        pushWarning(
          {
            type: "unresolved",
            section: "weapons",
            value: weapon.name,
            message: `Waffe "${weapon.name}" enthält keine Kampftechnik im Datensatz.`,
          },
          context,
        );
      }
    }

    if (!match && !fallback) {
      registerUnresolved("weapons", weapon.name, context);
    }

    results.push({
      source: weapon,
      normalizedSource: normalized,
      match,
      combatTechnique,
      fallback,
    });
  }
  return results;
}

function resolveArmor(
  armor: ArmorStats | null,
  context: ResolutionContext,
  loadAdaptationLevel: number,
): ResolvedArmor | null {
  if (!armor) {
    return null;
  }

  const description = armor.description ?? "";
  const trimmedDescription = description.trim();
  const descriptionLower = trimmedDescription.toLowerCase();
  const noteLower = (armor.notes ?? "").toLowerCase();
  const indicatesNoArmor =
    descriptionLower.includes("keine") || descriptionLower.includes("ohne");
  const hasStats =
    (armor.rs ?? 0) > 0 || (armor.be ?? 0) > 0 || trimmedDescription.length > 0;
  const likelyNaturalArmor =
    trimmedDescription.length === 0 ||
    descriptionLower.includes("natürlicher rüstungsschutz") ||
    noteLower.includes("natürlicher rüstungsschutz");

  if (
    !hasStats ||
    ((armor.rs ?? 0) === 0 && (armor.be ?? 0) === 0 && indicatesNoArmor)
  ) {
    return null;
  }

  let descriptionForLookup = trimmedDescription;
  if (
    trimmedDescription &&
    descriptionLower.includes("normale kleidung") &&
    descriptionLower.includes("oder nackt")
  ) {
    descriptionForLookup = "normale Kleidung";
  }

  const sanitizedDescription = sanitizeResolvableValue(descriptionForLookup);
  const normalized =
    sanitizedDescription.length > 0
      ? normalizeLabel(sanitizedDescription)
      : undefined;

  const match = normalized
    ? context.lookups.equipment.byName.get(normalized)
    : undefined;

  let datasetProtection: number | null | undefined;
  let datasetEncumbrance: number | null | undefined;

  if (match) {
    const stats = extractArmorStats(match);
    datasetProtection = stats?.protection;
    datasetEncumbrance = stats?.encumbrance;

    if (!stats) {
      pushWarning(
        {
          type: "unresolved",
          section: "armor",
          value: match.name,
          message: `Rüstung "${match.name}" enthält keine RS/BE-Daten im Optolith-Katalog.`,
        },
        context,
      );
    }

    if (
      typeof armor.rs === "number" &&
      typeof datasetProtection === "number" &&
      armor.rs !== datasetProtection
    ) {
      pushWarning(
        {
          type: "value-mismatch",
          section: "armor",
          value: trimmedDescription || match.name,
          message: `RS (${armor.rs}) weicht vom Optolith-Wert (${datasetProtection}) ab.`,
        },
        context,
      );
    }
    if (
      typeof armor.be === "number" &&
      typeof datasetEncumbrance === "number" &&
      armor.be !== datasetEncumbrance
    ) {
      const encumbranceReduction = loadAdaptationLevel * 2;
      const canCompensateReduction =
        loadAdaptationLevel > 0 &&
        armor.be < datasetEncumbrance &&
        datasetEncumbrance - armor.be <= encumbranceReduction;
      if (!canCompensateReduction) {
        pushWarning(
          {
            type: "value-mismatch",
            section: "armor",
            value: trimmedDescription || match.name,
            message: `BE (${armor.be}) weicht vom Optolith-Wert (${datasetEncumbrance}) ab.`,
          },
          context,
        );
      }
    }
  } else {
    const label =
      trimmedDescription || `RS ${armor.rs ?? "-"} / BE ${armor.be ?? "-"}`;
    if (likelyNaturalArmor) {
      const statsSummary =
        trimmedDescription.length > 0
          ? trimmedDescription
          : `RS ${armor.rs ?? "-"} / BE ${armor.be ?? "-"}`;
      const condensedStats =
        trimmedDescription.length > 0
          ? trimmedDescription
          : `RS ${armor.rs ?? "-"} / BE ${armor.be ?? "-"}`;
      pushWarning(
        {
          type: "fuzzy-match",
          section: "armor",
          value: statsSummary,
          message: `Eintrag "${condensedStats}" ohne Rüstungsbeschreibung; vermutlich natürlicher Rüstungsschutz.`,
        },
        context,
      );
    } else {
      registerUnresolved("armor", label, context);
    }
  }

  return {
    source: armor,
    normalizedSource: normalized,
    match,
    datasetProtection: datasetProtection ?? null,
    datasetEncumbrance: datasetEncumbrance ?? null,
    isNaturalArmor: !match && likelyNaturalArmor,
  };
}

function resolveLanguages(
  languages: readonly string[],
  context: ResolutionContext,
): ResolvedLanguage[] {
  return languages
    .map((raw) => sanitizeResolvableValue(raw))
    .filter((value) => value.length > 0)
    .map((value) => {
      const parsed = parseLevelledValue(value);
      const normalized = normalizeLabel(parsed.baseName);
      const option = context.lookups.languages.get(normalized);
      if (!option) {
        registerUnresolved("languages", value, context);
        return {
          source: value,
          normalizedSource: normalized,
          rawOption: parsed.baseName,
        };
      }

      if (parsed.level && option.maxLevel && parsed.level > option.maxLevel) {
        pushWarning(
          {
            type: "level-out-of-range",
            section: "languages",
            value,
            message: `Sprachstufe ${parsed.level} überschreitet den erlaubten Bereich (${option.maxLevel}).`,
          },
          context,
        );
      }

      return {
        source: value,
        normalizedSource: normalized,
        match: option.ability,
        option,
        level: parsed.level ?? undefined,
      };
    });
}

function parseLevelledValue(input: string): {
  baseName: string;
  level?: number;
} {
  const trimmed = input.trim();
  const match = trimmed.match(/^(.*?)(?:\s+([IVX\d]+(?:\+[IVX\d]+)*))?$/i);
  if (!match) {
    return { baseName: trimmed };
  }
  const baseName = (match[1] ?? trimmed).trim();
  const token = match[2]?.trim();
  if (!token) {
    return { baseName };
  }
  const level = normalizeTierToken(token);
  return {
    baseName,
    level: level ?? undefined,
  };
}

function romanToInteger(value: string): number | null {
  const map: Record<string, number> = { I: 1, V: 5, X: 10 };
  const chars = value.toUpperCase().split("");
  let total = 0;
  let previous = 0;
  for (const char of chars.reverse()) {
    const current = map[char];
    if (!current) {
      return null;
    }
    if (current < previous) {
      total -= current;
    } else {
      total += current;
      previous = current;
    }
  }
  return total;
}

function integerToRoman(value: number): string {
  const numerals: Array<[number, string]> = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = value;
  let result = "";
  for (const [threshold, numeral] of numerals) {
    while (remaining >= threshold) {
      result += numeral;
      remaining -= threshold;
    }
  }
  return result || "I";
}

function buildResolvedLabel(
  baseName: string,
  level?: number,
  option?: string,
): string {
  const trimmedBase = baseName.trim();
  const withLevel = level
    ? `${trimmedBase} ${integerToRoman(level)}`.trim()
    : trimmedBase;
  if (option && option.trim().length > 0) {
    return `${withLevel} (${option.trim()})`.trim();
  }
  return withLevel;
}

function normalizeTierToken(token: string): number | undefined {
  const parts = token
    .split("+")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (parts.length === 0) {
    return undefined;
  }
  const numericLevels = parts
    .map((part) => {
      const numeric = Number.parseInt(part, 10);
      if (!Number.isNaN(numeric)) {
        return numeric;
      }
      const roman = romanToInteger(part);
      return roman ?? undefined;
    })
    .filter((value): value is number => value !== undefined);
  if (numericLevels.length === 0) {
    return undefined;
  }
  return Math.max(...numericLevels);
}

function registerUnresolved(
  section: string,
  value: string,
  context: ResolutionContext,
): void {
  if (!context.unresolved.has(section)) {
    context.unresolved.set(section, new Set());
  }
  const entries = context.unresolved.get(section)!;
  const sizeBefore = entries.size;
  entries.add(value);
  if (entries.size !== sizeBefore) {
    pushWarning(
      {
        type: "unresolved",
        section,
        value,
        message: `Eintrag "${value}" konnte im Abschnitt ${section} nicht aufgelöst werden.`,
      },
      context,
    );
  }
}

function pushWarning(
  warning: ResolutionWarning,
  context: ResolutionContext,
): void {
  const key = `${warning.type}:${warning.section}:${warning.value}:${warning.message}`;
  if (context.warningKeys.has(key)) {
    return;
  }
  context.warningKeys.add(key);
  context.warnings.push(warning);
}

interface EquipmentFallbackMatch {
  readonly match: DerivedEntity;
  readonly token: string;
  readonly reason: "token" | "keyword";
  readonly keyword?: string;
}

function resolveEquipmentFallbackMatch(
  value: string,
  section: "weapons" | "equipment",
  context: ResolutionContext,
  optionCandidates: readonly string[] = [],
): DerivedEntity | undefined {
  const fallback = findEquipmentFallbackMatch(
    value,
    context.lookups.equipment,
    optionCandidates,
  );
  if (!fallback) {
    return undefined;
  }
  const message = buildEquipmentFallbackWarning(
    section,
    value,
    fallback.match.name,
    fallback,
  );
  pushWarning(
    {
      type: "fuzzy-match",
      section,
      value,
      message,
    },
    context,
  );
  return fallback.match;
}

function findEquipmentFallbackMatch(
  value: string,
  lookup: DerivedLookup,
  optionCandidates: readonly string[],
): EquipmentFallbackMatch | undefined {
  const normalizedOriginal = normalizeLabel(value);
  const tokens = collectCandidateTokens(value, optionCandidates);

  for (const token of tokens) {
    const normalizedToken = normalizeLabel(token);
    if (!normalizedToken) {
      continue;
    }
    if (normalizedToken === normalizedOriginal) {
      continue;
    }
    const direct = lookup.byName.get(normalizedToken);
    if (direct) {
      return {
        match: direct,
        token,
        reason: "token",
      };
    }
  }

  for (const token of tokens) {
    const normalizedToken = normalizeLabel(token);
    if (!normalizedToken) {
      continue;
    }
    for (const [keyword, fallbackNormalized] of Object.entries(
      EQUIPMENT_KEYWORD_FALLBACKS,
    )) {
      if (normalizedToken === keyword || normalizedToken.includes(keyword)) {
        const fallbackMatch = lookup.byName.get(fallbackNormalized);
        if (fallbackMatch) {
          return {
            match: fallbackMatch,
            token,
            reason: "keyword",
            keyword,
          };
        }
      }
    }
  }

  return undefined;
}

function collectCandidateTokens(
  value: string,
  optionCandidates: readonly string[],
): string[] {
  const tokens = new Set<string>();
  const push = (input: string | null | undefined) => {
    if (!input) {
      return;
    }
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      return;
    }
    const sanitized = stripTrailingQuantityToken(
      stripLeadingQuantityToken(trimmed),
    );
    addTokenWithVariants(tokens, sanitized);
    if (sanitized !== trimmed) {
      addTokenWithVariants(tokens, trimmed);
    }
  };

  push(value);

  const withoutParens = value.replace(/[()]/g, " ");
  withoutParens.split(/[-–—\/]/).forEach((segment) => {
    push(segment);
    segment.split(/[,&]/).forEach((part) => push(part));
  });
  withoutParens.split(/[,&]/).forEach((segment) => push(segment));
  withoutParens.split(/\s+/).forEach((part) => push(part));

  optionCandidates.forEach((candidate) => push(candidate));

  return Array.from(tokens.values());
}

function addTokenWithVariants(store: Set<string>, token: string): void {
  if (!token) {
    return;
  }
  if (!store.has(token)) {
    store.add(token);
  }
  for (const variant of deriveSingularForms(token)) {
    if (variant.length > 0) {
      store.add(variant);
    }
  }
}

function deriveSingularForms(value: string): string[] {
  const result = new Set<string>();
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  if (lower.length <= 2) {
    return [];
  }

  const add = (candidate: string) => {
    if (candidate && candidate !== trimmed) {
      result.add(candidate);
    }
  };

  const removeSuffix = (suffix: string, replacement = "") => {
    if (lower.endsWith(suffix) && trimmed.length > suffix.length + 1) {
      add(trimmed.slice(0, trimmed.length - suffix.length) + replacement);
    }
  };

  removeSuffix("en");
  removeSuffix("en", "e");
  removeSuffix("e");
  removeSuffix("er");
  removeSuffix("n");
  removeSuffix("s");

  return Array.from(result.values());
}

function buildEquipmentFallbackWarning(
  section: "weapons" | "equipment",
  original: string,
  matchName: string,
  fallback: EquipmentFallbackMatch,
): string {
  const subject = section === "weapons" ? "Waffe" : "Ausrüstungseintrag";
  if (fallback.reason === "keyword") {
    const keyword = fallback.keyword ?? fallback.token;
    return `${subject} "${original}" wurde als "${matchName}" interpretiert (Schlüsselwort "${keyword}").`;
  }
  return `${subject} "${original}" wurde als "${matchName}" interpretiert (Teilbegriff "${fallback.token}").`;
}

function isStandardBlessingsAggregate(value: string): boolean {
  const normalized = normalizeLabel(value);
  return (
    normalized === "die zwolf segnungen" ||
    normalized === "zwolf segnungen" ||
    normalized === "12 segnungen"
  );
}

function extractCombatTechniqueId(entry: DerivedEntity): string | undefined {
  const base = entry.base as Record<string, unknown> | undefined;
  if (!base || typeof base !== "object") {
    return undefined;
  }
  const special = (base as Record<string, unknown>).special as
    | Record<string, unknown>
    | undefined;
  if (!special || typeof special !== "object") {
    return undefined;
  }
  const combatTechnique = (special as Record<string, unknown>).combatTechnique;
  return typeof combatTechnique === "string" ? combatTechnique : undefined;
}

function extractArmorStats(
  entry: DerivedEntity,
): { protection?: number | null; encumbrance?: number | null } | undefined {
  const base = entry.base as Record<string, unknown> | undefined;
  if (!base || typeof base !== "object") {
    return undefined;
  }
  const special = (base as Record<string, unknown>).special as
    | Record<string, unknown>
    | undefined;
  if (!special || typeof special !== "object") {
    return undefined;
  }
  const protection = (special as Record<string, unknown>).protection;
  const encumbrance = (special as Record<string, unknown>).encumbrance;
  if (typeof protection !== "number" && typeof encumbrance !== "number") {
    return undefined;
  }
  return {
    protection: typeof protection === "number" ? protection : null,
    encumbrance: typeof encumbrance === "number" ? encumbrance : null,
  };
}

function findSelectOption(
  entry: DerivedEntity,
  optionName: string,
): { id: number; name: string } | undefined {
  const locale = entry.locale as Record<string, unknown>;
  const options = Array.isArray(locale?.selectOptions)
    ? (locale!.selectOptions as Record<string, unknown>[])
    : [];
  const normalizedOption = normalizeLabel(optionName);
  for (const option of options) {
    if (typeof option?.name !== "string" || typeof option?.id !== "number") {
      continue;
    }
    const normalized = normalizeLabel(option.name);
    if (normalized === normalizedOption) {
      return { id: option.id, name: option.name };
    }
  }
  return undefined;
}

function hasSelectOptions(entry: DerivedEntity): boolean {
  const locale = entry.locale as Record<string, unknown>;
  return (
    Array.isArray(locale?.selectOptions) &&
    (locale!.selectOptions as unknown[]).length > 0
  );
}

function sanitizeResolvableValue(value: string): string {
  if (!value) {
    return value;
  }
  const withoutCitations = value.replace(CITATION_PATTERN, " ");
  const withoutEmptyParens = withoutCitations.replace(/\(\s*\)/g, "");
  const normalizedPlus = withoutEmptyParens.replace(/\s*\+\s*/g, "+");
  const collapsedWhitespace = normalizedPlus.replace(/\s+/g, " ").trim();
  const withoutTrailingDelimiters = collapsedWhitespace
    .replace(TRAILING_DELIMITER_PATTERN, "")
    .trim();
  return applyLabelOverrides(
    normalizeTraditionLabels(withoutTrailingDelimiters),
  );
}

function normalizeTraditionLabels(label: string): string {
  return label.replace(
    /(Tradition\s*\()([^)]*?)geweih(?:ter|te|ten)(\))/gi,
    (_match, prefix, body, suffix) => {
      const base = body.trim().replace(/[-\s]+$/g, "");
      if (!base) {
        return `${prefix}${body}${suffix}`;
      }
      // Preserve original casing for the base while appending "kirche".
      const combined = `${base}kirche`;
      return `${prefix}${combined}${suffix}`;
    },
  );
}

function applyLabelOverrides(label: string): string {
  const overrides: Record<string, string> = {
    analys: "Analys Arkanstruktur",
    odem: "Odem Arcanum",
    zauberklinge: "Zauberklinge Geisterspeer",
  };
  const normalized = normalizeLabel(label);
  return overrides[normalized] ?? label;
}

function stripLeadingQuantityToken(value: string): string {
  const working = value.trim();
  const numericMatch = working.match(/^(\d+)\s+(.*)$/u);
  if (numericMatch && numericMatch[2]) {
    return numericMatch[2].trim();
  }

  const wordMatch = working.match(/^([A-Za-zÄÖÜäöüß]+)\s+(.*)$/u);
  if (wordMatch && wordMatch[2]) {
    const word = wordMatch[1]?.toLowerCase();
    if (word && NUMBER_WORDS.has(word)) {
      return wordMatch[2].trim();
    }
  }

  return working;
}

function stripTrailingQuantityToken(value: string): string {
  return value.replace(/\(\s*(?:x\s*)?\d+\s*\)\s*$/iu, "").trim();
}

function parseEntryComponents(value: string): {
  baseName: string;
  options: readonly string[];
  level?: number;
} {
  let working = value.trim();
  working = stripTrailingQuantityToken(stripLeadingQuantityToken(working));
  working = working.replace(/([IVX]+)\s*-\s*([IVX]+)/gi, "$1+$2");
  let levelToken: string | undefined;
  const options: string[] = [];

  const extractLevel = () => {
    const match = working.match(/\s+([IVX\d]+(?:\+[IVX\d]+)*)$/i);
    if (match) {
      levelToken = match[1]?.trim();
      working = working.slice(0, match.index).trim();
    }
  };

  extractLevel();

  while (true) {
    const optionMatch = working.match(/\(([^)]+)\)\s*$/);
    if (!optionMatch) {
      break;
    }
    const valueInside = optionMatch[1]?.trim();
    if (valueInside) {
      const splittedOptions = valueInside
        .split(/[,;]/)
        .map((option) => option.trim())
        .filter((option): option is string => option.length > 0);
      if (splittedOptions.length === 0) {
        options.unshift(valueInside);
      } else {
        for (let index = splittedOptions.length - 1; index >= 0; index -= 1) {
          const optionValue = splittedOptions[index];
          if (optionValue) {
            options.unshift(optionValue);
          }
        }
      }
    }
    working = working.slice(0, optionMatch.index).trim();
  }

  if (!levelToken) {
    extractLevel();
  }

  const level = levelToken ? normalizeTierToken(levelToken) : undefined;

  return {
    baseName: working,
    options,
    level: level ?? undefined,
  };
}

function findNearestLookupEntry(
  target: string,
  lookup: Map<string, DerivedEntity>,
  maxDistance: number,
): { entry: DerivedEntity; normalized: string; distance: number } | undefined {
  let best:
    | { entry: DerivedEntity; normalized: string; distance: number }
    | undefined;
  for (const [normalized, entry] of lookup.entries()) {
    if (Math.abs(normalized.length - target.length) > maxDistance) {
      continue;
    }
    const distance = levenshteinDistanceWithin(normalized, target, maxDistance);
    if (distance === undefined) {
      continue;
    }
    if (!best || distance < best.distance) {
      best = { entry, normalized, distance };
      if (distance === 0) {
        return best;
      }
    }
  }
  return best;
}

function levenshteinDistanceWithin(
  source: string,
  target: string,
  maxDistance: number,
): number | undefined {
  const sourceLength = source.length;
  const targetLength = target.length;
  if (Math.abs(sourceLength - targetLength) > maxDistance) {
    return undefined;
  }
  if (sourceLength === 0) {
    return targetLength <= maxDistance ? targetLength : undefined;
  }
  if (targetLength === 0) {
    return sourceLength <= maxDistance ? sourceLength : undefined;
  }

  const previous: number[] = Array.from(
    { length: targetLength + 1 },
    (_, index) => index,
  );
  const current: number[] = new Array(targetLength + 1);

  for (let i = 1; i <= sourceLength; i += 1) {
    current[0] = i;
    let rowMin = current[0];
    const sourceChar = source.charAt(i - 1);
    for (let j = 1; j <= targetLength; j += 1) {
      const cost = sourceChar === target.charAt(j - 1) ? 0 : 1;
      current[j] = Math.min(
        previous[j]! + 1,
        current[j - 1]! + 1,
        previous[j - 1]! + cost,
      );
      rowMin = Math.min(rowMin, current[j]!);
    }
    if (rowMin > maxDistance) {
      return undefined;
    }
    previous.splice(0, previous.length, ...current);
  }

  const distance = previous[targetLength]!;
  return distance <= maxDistance ? distance : undefined;
}

function extractLanguageEntries(
  entries: readonly string[],
  languages: Set<string>,
  lookups: OptolithDatasetLookups,
): string[] {
  const remaining: string[] = [];
  for (const entry of entries) {
    const sanitized = sanitizeResolvableValue(entry);
    if (/^muttersprache\b/i.test(sanitized)) {
      languages.add(normalizeMutterspracheEntry(sanitized));
      continue;
    }
    const components = parseEntryComponents(sanitized);
    const normalizedBase = normalizeLabel(components.baseName);
    const languageOption =
      lookups.languages.get(normalizedBase) ??
      lookups.scripts.get(normalizedBase);
    if (languageOption) {
      if (components.level !== undefined) {
        languages.add(
          `${components.baseName} ${integerToRoman(components.level)}`,
        );
      } else {
        languages.add(components.baseName);
      }
      continue;
    }
    remaining.push(entry);
  }
  return remaining;
}

function extractSpecialAbilitiesFromNotes(
  notes: Readonly<Record<string, string>>,
): string[] {
  const abilities = new Set<string>();
  for (const content of Object.values(notes)) {
    if (!content) {
      continue;
    }
    const segments = content.split(/;+/);
    for (const segment of segments) {
      const trimmed = segment.trim();
      if (!trimmed) {
        continue;
      }
      const paktMatch = trimmed.match(/^Paktgeschenke?:\s*(.+)$/i);
      if (paktMatch) {
        const ability = paktMatch[1]?.trim();
        if (ability) {
          abilities.add(ability);
        }
      }
    }
  }
  return Array.from(abilities);
}

function normalizeAdvantageDisadvantageLists(
  statBlock: ParsedStatBlock,
  lookups: OptolithDatasetLookups,
): { advantages: string[]; disadvantages: string[]; languages: string[] } {
  const advantages = new Set<string>();
  const disadvantages = new Set<string>();
  const languages = new Set<string>();

  const process = (value: string, suggested: "advantage" | "disadvantage") => {
    const sanitized = sanitizeResolvableValue(value);
    if (!sanitized) {
      return;
    }
    if (/^muttersprache\b/i.test(sanitized)) {
      const languageEntry = normalizeMutterspracheEntry(sanitized);
      languages.add(languageEntry);
      return;
    }

    const variants = preprocessAdvDisadvEntry(sanitized);
    for (const variant of variants) {
      const { label, baseLabel, detail } = normalizeAdvDisadvEntry(variant);
      const normalizedKey = normalizeLabel(baseLabel);
      let advantageMatch = lookups.advantages.byName.get(normalizedKey);
      let disadvantageMatch = lookups.disadvantages.byName.get(normalizedKey);

      if (!advantageMatch && !disadvantageMatch && detail) {
        const combinedKey = normalizeLabel(`${baseLabel} (${detail})`);
        advantageMatch = lookups.advantages.byName.get(combinedKey);
        disadvantageMatch = lookups.disadvantages.byName.get(combinedKey);
      }

      if (advantageMatch && !disadvantageMatch) {
        advantages.add(label);
        continue;
      }
      if (disadvantageMatch && !advantageMatch) {
        disadvantages.add(label);
        continue;
      }
      if (advantageMatch && disadvantageMatch) {
        if (suggested === "advantage") {
          advantages.add(label);
        } else {
          disadvantages.add(label);
        }
        continue;
      }

      const hint = classifyAdvDisadvantageHint(label);
      if (hint === "advantage") {
        advantages.add(label);
        continue;
      }
      if (hint === "disadvantage") {
        disadvantages.add(label);
        continue;
      }

      if (suggested === "advantage") {
        advantages.add(label);
      } else {
        disadvantages.add(label);
      }
    }
  };

  for (const entry of statBlock.advantages) {
    process(entry, "advantage");
  }
  for (const entry of statBlock.disadvantages) {
    process(entry, "disadvantage");
  }

  return {
    advantages: Array.from(advantages),
    disadvantages: Array.from(disadvantages),
    languages: Array.from(languages),
  };
}

function preprocessAdvDisadvEntry(entry: string): string[] {
  const expanded = expandAngstVorEntry(entry);
  const results: string[] = [];
  for (const candidate of expanded) {
    const personality = tryConvertPersonalityWeakness(candidate);
    if (personality) {
      results.push(personality);
      continue;
    }
    results.push(applyImmunityNormalization(candidate));
  }
  return Array.from(new Set(results));
}

function applyImmunityNormalization(entry: string): string {
  const match = entry.match(/^Immunität gegen\s+([^()]+)$/i);
  if (match && match[1]) {
    const detail = match[1].trim();
    if (detail.length > 0) {
      return `Immunität gegen (${detail})`;
    }
  }
  return entry;
}

function tryConvertPersonalityWeakness(entry: string): string | undefined {
  if (/^persönlichkeitsschwäche\b/i.test(entry)) {
    return entry.replace(
      /^persönlichkeitsschwäche/i,
      "Persönlichkeitsschwächen",
    );
  }
  if (/^persönlichkeitsschwächen\b/i.test(entry)) {
    return entry;
  }

  const trimmed = entry.trim();
  if (!trimmed) {
    return undefined;
  }
  const lower = trimmed.toLowerCase();

  for (const option of PERSONALITY_WEAKNESS_OPTIONS) {
    const optionLower = option.toLowerCase();
    if (lower === optionLower || lower.startsWith(`${optionLower} `)) {
      return `Persönlichkeitsschwächen (${trimmed})`;
    }
  }

  return undefined;
}

function expandAngstVorEntry(entry: string): string[] {
  const trimmed = entry.trim();
  const prefixMatch = trimmed.match(/^Angst vor\b(.*)$/i);
  if (!prefixMatch) {
    return [trimmed];
  }

  const remainder = prefixMatch[1]?.trim() ?? "";
  if (!remainder) {
    return [`Angst vor`];
  }

  let inner = remainder;
  if (inner.startsWith("(") && inner.endsWith(")")) {
    inner = inner.slice(1, -1).trim();
  } else {
    const nested = inner.match(/\(([^)]+)\)/);
    if (nested && nested[1]) {
      inner = nested[1].trim();
    } else {
      inner = inner.trim();
    }
  }

  inner = inner.replace(/^…\s*/u, "");
  if (!inner) {
    return [`Angst vor`];
  }

  const parts = inner
    .split(/[,;/]/)
    .map((part) => {
      const trimmedPart = part.trim();
      const withoutEllipsis = trimmedPart.replace(/^…\s*/u, "");
      const withoutParens = withoutEllipsis
        .replace(/^\(+/u, "")
        .replace(/\)+$/u, "");
      return withoutParens.trim();
    })
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return [`Angst vor (${inner})`];
  }

  return parts.map((part) => `Angst vor (${part})`);
}

function normalizeAdvDisadvEntry(value: string): {
  label: string;
  baseLabel: string;
  detail?: string;
} {
  let working = value.trim();
  working = working.replace(/([IVX]+)\s*-\s*([IVX]+)/gi, "$1+$2");

  const tierMatch = working.match(/\s+([IVX\d]+(?:\+[IVX\d]+)*)$/i);
  let tierToken: string | undefined;
  if (tierMatch) {
    tierToken = tierMatch[1];
    working = working.slice(0, tierMatch.index).trim();
  }

  let detail: string | undefined;
  const inlineFearMatch = working.match(/^Angst vor\s+(.+)$/i);
  if (inlineFearMatch) {
    const extracted = inlineFearMatch[1]?.trim();
    if (extracted && !extracted.startsWith("(")) {
      detail = extracted;
      working = "Angst vor";
    }
  }

  const detailMatch = working.match(/\s*\(([^)]+)\)\s*$/);
  if (detailMatch) {
    detail = detailMatch[1];
    working = working.slice(0, detailMatch.index).trim();
  }

  if (!tierToken) {
    const trailingTier = working.match(/\s+([IVX\d]+(?:\+[IVX\d]+)*)$/i);
    if (trailingTier) {
      tierToken = trailingTier[1];
      working = working.slice(0, trailingTier.index).trim();
    }
  }

  const canonicalBase = applyAdvantageAlias(working);
  let label = canonicalBase;
  const levelNumber = tierToken ? normalizeTierToken(tierToken) : undefined;
  if (levelNumber) {
    label = `${label} ${integerToRoman(levelNumber)}`.trim();
  }
  if (detail) {
    label = `${label} (${detail})`.trim();
  }

  return {
    label,
    baseLabel: canonicalBase,
    detail,
  };
}

function normalizeMutterspracheEntry(value: string): string {
  let remainder = value.replace(/^muttersprache/i, "").trim();
  if (!remainder) {
    return "Garethi III";
  }
  const tierMatch = remainder.match(/([IVX\d]+)$/i);
  let tierToken: string | undefined;
  if (tierMatch) {
    tierToken = tierMatch[1];
    remainder = remainder.slice(0, tierMatch.index).trim();
  }
  const levelNumber = normalizeTierToken(tierToken ?? "III") ?? 3;
  return `${remainder} ${integerToRoman(levelNumber)}`.trim();
}

function applyAdvantageAlias(base: string): string {
  const normalized = normalizeLabel(base);
  const alias = ADV_DISADV_BASE_ALIASES[normalized];
  return alias ?? base;
}

const ADVANTAGE_HINTS = [
  "beidhändig",
  "dunkelsicht",
  "richtungssinn",
  "entfernungssinn",
  "zauberer",
  "zäher hund",
  "blutrausch",
  "herausragender sinn",
  "giftresistenz",
];

const DISADVANTAGE_HINTS = [
  "schlechte eigenschaft",
  "eingeschränkter sinn",
  "angst vor",
  "blind",
  "kälteempfindlich",
  "zauberanfällig",
];

function classifyAdvDisadvantageHint(
  label: string,
): "advantage" | "disadvantage" | "unknown" {
  const normalized = normalizeLabel(label);
  if (ADVANTAGE_HINTS.some((hint) => normalized.includes(hint))) {
    return "advantage";
  }
  if (DISADVANTAGE_HINTS.some((hint) => normalized.includes(hint))) {
    return "disadvantage";
  }
  return "unknown";
}
