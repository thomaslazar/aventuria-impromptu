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
  readonly type: "unresolved" | "level-out-of-range" | "unresolved-option";
  readonly section: string;
  readonly value: string;
  readonly message: string;
}

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

  const advantages = resolveSection(
    statBlock.advantages,
    "advantages",
    context.lookups.advantages,
    context,
  );
  const disadvantages = resolveSection(
    statBlock.disadvantages,
    "disadvantages",
    context.lookups.disadvantages,
    context,
  );

  const specialAbilities = resolveSection(
    statBlock.specialAbilities,
    "specialAbilities",
    context.lookups.specialAbilities,
    context,
  );
  const combatSpecialAbilities = resolveSection(
    statBlock.combatSpecialAbilities,
    "combatSpecialAbilities",
    context.lookups.specialAbilities,
    context,
  );

  const languages = resolveLanguages(statBlock.languages, context);

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
  return values.map((value) => {
    const parsed = splitParenthetical(value);
    const leveled = parseLevelledValue(parsed.base);
    const normalized = normalizeLabel(leveled.baseName);
    const match = lookup.byName.get(normalized);
    if (!match) {
      registerUnresolved(section, value, context);
    }
    let selectOption: { id: number; name: string } | undefined;
    let rawOption: string | undefined;
    if (match && parsed.option && hasSelectOptions(match)) {
      const option = findSelectOption(match, parsed.option);
      if (option) {
        selectOption = option;
      } else {
        rawOption = parsed.option;
      }
    }
    return {
      source: value,
      normalizedSource: normalized,
      match,
      selectOption,
      level: leveled.level ?? undefined,
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
  return entries.map((entry) => {
    const normalized = normalizeLabel(entry.name);
    const match = lookup.byName.get(normalized);
    if (!match) {
      registerUnresolved(section, entry.name, context);
    }
    return {
      source: entry.name,
      normalizedSource: normalized,
      match,
      value: entry.value,
    };
  });
}

function resolveTalents(
  talents: readonly TalentRating[],
  context: ResolutionContext,
): ResolvedTalent[] {
  return talents.map((talent) => {
    const normalized = normalizeLabel(talent.name);
    const match = context.lookups.skills.byName.get(normalized);
    if (!match) {
      registerUnresolved("talents", talent.name, context);
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
  return languages.map((value) => {
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
  const match = trimmed.match(/^(.*?)(?:\s+([IVX]+))?$/i);
  if (!match) {
    return { baseName: trimmed };
  }
  const baseName = (match[1] ?? trimmed).trim();
  const roman = match[2]?.trim();
  if (!roman) {
    return { baseName };
  }
  const level = romanToInteger(roman);
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

function splitParenthetical(value: string): { base: string; option?: string } {
  const match = value.match(/^(.*?)\s*\((.+)\)$/);
  if (!match) {
    return { base: value.trim() };
  }
  const base = match[1]?.trim() ?? value.trim();
  const option = match[2]?.trim();
  return option ? { base, option } : { base };
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
