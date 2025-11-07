import type { OptolithDatasetLookups } from "./dataset";
import type { ResolutionResult, ResolvedWeapon } from "./resolver";
import type { ParseResult } from "../../types/optolith/stat-block";

interface EquipmentBaseSpecial {
  readonly combatTechnique?: string;
  readonly at?: number;
  readonly pa?: number;
  readonly fk?: number;
}

interface EquipmentBase {
  readonly special?: EquipmentBaseSpecial;
}

interface DerivedWeaponDetail {
  readonly weaponName: string;
  readonly combatTechniqueId: string;
  readonly combatTechniqueName?: string;
  readonly derivedValue: number;
  readonly sourceAttack?: number | null;
  readonly sourceRangedAttack?: number | null;
  readonly attributeBonus: number;
  readonly weaponModifier: number;
  readonly fallback?: ResolvedWeapon["fallback"];
}

export interface DerivedCombatTechniquesResult {
  readonly values: Record<string, number>;
  readonly warnings: string[];
  readonly details: readonly DerivedWeaponDetail[];
}

function attributeBonus(value: number | undefined): number {
  if (value === undefined || value <= 8) {
    return 0;
  }
  return Math.floor((value - 8) / 3);
}

function getWeaponModifiers(match: ResolvedWeapon["match"]): {
  at: number;
  fk: number;
} {
  if (!match) {
    return { at: 0, fk: 0 };
  }
  const base = match.base as EquipmentBase | undefined;
  const special = base?.special;
  return {
    at: typeof special?.at === "number" ? special.at : 0,
    fk: typeof special?.fk === "number" ? special.fk : 0,
  };
}

function resolveCombatTechniqueId(weapon: ResolvedWeapon): string | undefined {
  if (weapon.combatTechnique?.id) {
    return weapon.combatTechnique.id;
  }
  if (weapon.fallback === "unarmed") {
    return "CT_9"; // Raufen
  }
  return undefined;
}

export function deriveCombatTechniques(
  parsed: ParseResult,
  resolved: ResolutionResult,
  lookups: OptolithDatasetLookups,
): DerivedCombatTechniquesResult {
  const mu = parsed.model.attributes.MU ?? 0;
  const ff = parsed.model.attributes.FF ?? 0;

  const details: DerivedWeaponDetail[] = [];
  const warnings: string[] = [];
  const resultMap = new Map<
    string,
    { value: number; sources: Array<{ name: string; value: number }> }
  >();

  const registerValue = (
    ctId: string,
    ctName: string | undefined,
    value: number,
    weaponName: string,
  ) => {
    const bounded = Math.max(6, Math.round(value));
    const existing = resultMap.get(ctId);
    if (existing) {
      if (!existing.sources.some((entry) => entry.name === weaponName)) {
        existing.sources.push({ name: weaponName, value: bounded });
      }
      if (bounded > existing.value) {
        existing.value = bounded;
      }
      const distinctValues = new Set(
        existing.sources.map((entry) => entry.value),
      );
      if (distinctValues.size > 1) {
        const contributors = existing.sources
          .map((entry) => `${entry.name} ⇒ ${entry.value}`)
          .join(", ");
        warnings.push(
          `[Exporter] combatTechniques: Technik ${ctName ?? ctId} hat widersprüchliche Werte (${contributors}).`,
        );
      }
    } else {
      resultMap.set(ctId, {
        value: bounded,
        sources: [{ name: weaponName, value: bounded }],
      });
    }
  };

  const combatTechniqueName = (ctId: string): string | undefined => {
    const entry = lookups.combatTechniques.byId.get(ctId);
    return entry?.name;
  };

  for (const weapon of resolved.weapons) {
    const ctId = resolveCombatTechniqueId(weapon);
    if (!ctId) {
      continue;
    }
    const modifiers = getWeaponModifiers(weapon.match);
    const ctName = combatTechniqueName(ctId);
    let derived: number | undefined;
    let attributeBonusContribution = 0;
    let weaponModifierContribution = 0;
    const sourceAttack = weapon.source.attack ?? null;
    const sourceRangedAttack = weapon.source.rangedAttack ?? null;
    if (weapon.source.attack !== null && weapon.source.attack !== undefined) {
      attributeBonusContribution = attributeBonus(mu);
      weaponModifierContribution = modifiers.at;
      derived =
        weapon.source.attack -
        attributeBonusContribution -
        weaponModifierContribution;
    } else if (
      weapon.source.rangedAttack !== null &&
      weapon.source.rangedAttack !== undefined
    ) {
      attributeBonusContribution = attributeBonus(ff);
      weaponModifierContribution = modifiers.fk;
      derived =
        weapon.source.rangedAttack -
        attributeBonusContribution -
        weaponModifierContribution;
    }

    if (derived === undefined) {
      continue;
    }

    const boundedValue = Math.max(6, Math.round(derived));
    details.push({
      weaponName: weapon.source.name,
      combatTechniqueId: ctId,
      combatTechniqueName: ctName,
      derivedValue: boundedValue,
      sourceAttack,
      sourceRangedAttack,
      attributeBonus: attributeBonusContribution,
      weaponModifier: weaponModifierContribution,
      fallback: weapon.fallback,
    });
    registerValue(ctId, ctName, derived, weapon.source.name);
  }

  return {
    values: Object.fromEntries(
      Array.from(resultMap.entries()).map(([ctId, entry]) => [
        ctId,
        entry.value,
      ]),
    ),
    warnings,
    details,
  };
}
