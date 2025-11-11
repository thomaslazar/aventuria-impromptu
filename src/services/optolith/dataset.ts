import type {
  DerivedEntity,
  OptolithDatasetManifest,
} from "../../types/optolith/manifest";
import { normalizeLabel } from "../../utils/optolith/normalizer";

export interface OptolithDataset {
  readonly manifest: OptolithDatasetManifest;
  readonly advantages: readonly DerivedEntity[];
  readonly disadvantages: readonly DerivedEntity[];
  readonly specialAbilities: readonly DerivedEntity[];
  readonly skills: readonly DerivedEntity[];
  readonly combatTechniques: readonly DerivedEntity[];
  readonly spells: readonly DerivedEntity[];
  readonly cantrips: readonly DerivedEntity[];
  readonly liturgies: readonly DerivedEntity[];
  readonly blessings: readonly DerivedEntity[];
  readonly equipment: readonly DerivedEntity[];
}

export interface DerivedLookup {
  readonly byId: Map<string, DerivedEntity>;
  readonly byName: Map<string, DerivedEntity>;
}

export interface SelectOptionReference {
  readonly ability: DerivedEntity;
  readonly optionId: number;
  readonly name: string;
  readonly normalizedName: string;
  readonly maxLevel?: number;
}

export interface OptolithDatasetLookups {
  readonly manifest: OptolithDatasetManifest;
  readonly advantages: DerivedLookup;
  readonly disadvantages: DerivedLookup;
  readonly specialAbilities: DerivedLookup;
  readonly skills: DerivedLookup;
  readonly combatTechniques: DerivedLookup;
  readonly spells: DerivedLookup;
  readonly cantrips: DerivedLookup;
  readonly liturgies: DerivedLookup;
  readonly blessings: DerivedLookup;
  readonly equipment: DerivedLookup;
  readonly languages: Map<string, SelectOptionReference>;
  readonly scripts: Map<string, SelectOptionReference>;
}

export function createDatasetLookups(
  dataset: OptolithDataset,
): OptolithDatasetLookups {
  const specialAbilitiesLookup = buildLookup(dataset.specialAbilities);
  return {
    manifest: dataset.manifest,
    advantages: buildLookup(dataset.advantages),
    disadvantages: buildLookup(dataset.disadvantages),
    specialAbilities: specialAbilitiesLookup,
    skills: buildLookup(dataset.skills),
    combatTechniques: buildLookup(dataset.combatTechniques),
    spells: buildLookup(dataset.spells),
    cantrips: buildLookup(dataset.cantrips),
    liturgies: buildLookup(dataset.liturgies),
    blessings: buildLookup(dataset.blessings),
    equipment: buildLookup(dataset.equipment),
    languages: buildLanguageLookup(dataset.specialAbilities, "SA_29"),
    scripts: buildLanguageLookup(dataset.specialAbilities, "SA_27"),
  };
}

export function buildLookup(entries: readonly DerivedEntity[]): DerivedLookup {
  const byId = new Map<string, DerivedEntity>();
  const byName = new Map<string, DerivedEntity>();

  for (const entry of entries) {
    byId.set(entry.id, entry);
    byName.set(entry.normalizedName, entry);
    for (const synonym of entry.synonyms ?? []) {
      const normalized = normalizeLabel(synonym);
      if (!normalized) {
        continue;
      }
      if (!byName.has(normalized)) {
        byName.set(normalized, entry);
      }
    }
    const localeName =
      typeof (entry.locale as Record<string, unknown>)?.name === "string"
        ? String((entry.locale as Record<string, unknown>).name)
        : undefined;
    if (localeName) {
      const normalized = normalizeLabel(localeName);
      if (normalized && !byName.has(normalized)) {
        byName.set(normalized, entry);
      }
    }
  }

  return { byId, byName };
}

function buildLanguageLookup(
  specialAbilities: readonly DerivedEntity[],
  abilityId: string,
): Map<string, SelectOptionReference> {
  const ability = specialAbilities.find((entry) => entry.id === abilityId);
  const lookup = new Map<string, SelectOptionReference>();
  if (!ability) {
    return lookup;
  }

  const locale = ability.locale as Record<string, unknown>;
  const selectOptions = Array.isArray(locale?.selectOptions)
    ? (locale.selectOptions as Record<string, unknown>[])
    : [];

  const maxLevel =
    typeof ability.base === "object" && ability.base !== null
      ? Number.parseInt(
          String((ability.base as Record<string, unknown>).levels ?? ""),
          10,
        )
      : undefined;

  for (const option of selectOptions) {
    if (
      !option ||
      typeof option.name !== "string" ||
      typeof option.id !== "number"
    ) {
      continue;
    }
    const normalizedName = normalizeLabel(option.name);
    lookup.set(normalizedName, {
      ability,
      optionId: option.id,
      name: option.name,
      normalizedName,
      maxLevel: Number.isFinite(maxLevel) ? maxLevel : undefined,
    });
  }

  return lookup;
}
