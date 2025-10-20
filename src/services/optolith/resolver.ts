import type { OptolithDatasetLookups, SelectOptionReference } from "./dataset";
import type {
  ParsedStatBlock,
  RatedEntry,
  TalentRating,
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

export interface ResolutionWarning {
  readonly type:
    | "unresolved"
    | "level-out-of-range"
    | "unresolved-option"
    | "fuzzy-match";
  readonly section: string;
  readonly value: string;
  readonly message: string;
}

const ADV_DISADV_BASE_ALIASES: Record<string, string> = {
  "schlechte eigenschaften": "Schlechte Eigenschaft",
  "schlechte eigenschaft": "Schlechte Eigenschaft",
  dammerungssicht: "Dunkelsicht",
  dammersicht: "Dunkelsicht",
};

const CITATION_PATTERN = /AKO(?:[IVXLCDM]+)?\s*\d{1,4}/g;
const TRAILING_DELIMITER_PATTERN = /[,:;]+$/;

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
  readonly unresolved: Readonly<Record<string, readonly string[]>>;
  readonly warnings: readonly ResolutionWarning[];
}

interface ResolutionContext {
  readonly lookups: OptolithDatasetLookups;
  readonly warnings: ResolutionWarning[];
  readonly unresolved: Map<string, Set<string>>;
}

export function resolveStatBlock(
  statBlock: ParsedStatBlock,
  lookups: OptolithDatasetLookups,
): ResolutionResult {
  const context: ResolutionContext = {
    lookups,
    warnings: [],
    unresolved: new Map(),
  };

  const normalizedAdvDisadv = normalizeAdvantageDisadvantageLists(
    statBlock,
    lookups,
  );
  const languageAccumulator = new Set(normalizedAdvDisadv.languages);

  const specialAbilityEntries = extractLanguageEntries(
    statBlock.specialAbilities,
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

      if (!optionNameForLabel && usedOptionForNormalization) {
        optionNameForLabel = usedOptionForNormalization;
      }

      const sourceLabel = buildResolvedLabel(
        components.baseName,
        components.level,
        optionNameForLabel,
      );

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
        context.warnings.push({
          type: "fuzzy-match",
          section: "talents",
          value: talent.name,
          message: `Talent "${talent.name}" wurde als "${match.name}" interpretiert (Schreibweise korrigiert).`,
        });
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
        context.warnings.push({
          type: "level-out-of-range",
          section: "languages",
          value,
          message: `Sprachstufe ${parsed.level} überschreitet den erlaubten Bereich (${option.maxLevel}).`,
        });
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
  context.unresolved.get(section)!.add(value);
  context.warnings.push({
    type: "unresolved",
    section,
    value,
    message: `Eintrag "${value}" konnte im Abschnitt ${section} nicht aufgelöst werden.`,
  });
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
  return withoutTrailingDelimiters;
}

function parseEntryComponents(value: string): {
  baseName: string;
  options: readonly string[];
  level?: number;
} {
  let working = value.trim();
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
      options.unshift(valueInside);
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

    const { label, baseLabel, detail } = normalizeAdvDisadvEntry(sanitized);
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
      return;
    }
    if (disadvantageMatch && !advantageMatch) {
      disadvantages.add(label);
      return;
    }
    if (advantageMatch && disadvantageMatch) {
      if (suggested === "advantage") {
        advantages.add(label);
      } else {
        disadvantages.add(label);
      }
      return;
    }

    const hint = classifyAdvDisadvantageHint(label);
    if (hint === "advantage") {
      advantages.add(label);
      return;
    }
    if (hint === "disadvantage") {
      disadvantages.add(label);
      return;
    }

    if (suggested === "advantage") {
      advantages.add(label);
    } else {
      disadvantages.add(label);
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

function normalizeAdvDisadvEntry(value: string): {
  label: string;
  baseLabel: string;
  detail?: string;
} {
  let working = value.trim();

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
    if (extracted) {
      detail = extracted;
    }
    working = "Angst vor";
  }

  const detailMatch = working.match(/\s*\(([^)]+)\)\s*$/);
  if (detailMatch) {
    detail = detailMatch[1];
    working = working.slice(0, detailMatch.index).trim();
  }

  const canonicalBase = applyAdvantageAlias(working);
  const parts: string[] = [canonicalBase];
  if (detail) {
    parts.push(`(${detail})`);
  }

  let label = parts.join(" ");
  const levelNumber = tierToken ? normalizeTierToken(tierToken) : undefined;
  if (levelNumber) {
    label = `${label} ${integerToRoman(levelNumber)}`.trim();
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
