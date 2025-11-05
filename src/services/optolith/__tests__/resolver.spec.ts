import { beforeAll, describe, expect, it } from "vitest";

import { createDatasetLookups } from "../dataset";
import type { OptolithDatasetLookups } from "../dataset";
import { resolveStatBlock } from "../resolver";
import type {
  ArmorStats,
  ParsedStatBlock,
  WeaponStats,
} from "../../../types/optolith/stat-block";

import { loadDataset } from "./helpers";

let lookups: OptolithDatasetLookups;

beforeAll(async () => {
  const dataset = await loadDataset();
  lookups = createDatasetLookups(dataset);
});

function createStatBlock(overrides: Partial<ParsedStatBlock>): ParsedStatBlock {
  return {
    name: "Specimen",
    attributes: {},
    pools: {},
    weapons: [],
    advantages: [],
    disadvantages: [],
    specialAbilities: [],
    combatSpecialAbilities: [],
    languages: [],
    spells: [],
    liturgies: [],
    rituals: [],
    blessings: [],
    equipment: [],
    talents: [],
    notes: {},
    extras: [],
    ...overrides,
  } as ParsedStatBlock;
}

function createWeapon(overrides: Partial<WeaponStats>): WeaponStats {
  return {
    name: "Testwaffe",
    category: "melee",
    attack: null,
    parry: null,
    rangedAttack: null,
    damage: null,
    range: null,
    load: null,
    reach: null,
    notes: null,
    raw: {},
    rawInput: "",
    ...overrides,
  } as WeaponStats;
}

function createArmor(overrides: Partial<ArmorStats>): ArmorStats {
  return {
    rs: null,
    be: null,
    description: null,
    notes: null,
    raw: "",
    ...overrides,
  } as ArmorStats;
}

describe("resolveStatBlock", () => {
  it("normalizes plural disadvantages and resolves select options", () => {
    const statBlock = createStatBlock({
      disadvantages: ["Schlechte Eigenschaften (Neugier)"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.disadvantages).toHaveLength(1);
    const disadvantage = resolved.disadvantages[0];
    expect(disadvantage).toBeDefined();
    if (!disadvantage) {
      throw new Error("Expected disadvantage to resolve");
    }
    expect(disadvantage.source).toBe("Schlechte Eigenschaft (Neugier)");
    expect(disadvantage.match?.id).toBeDefined();
    expect(disadvantage.selectOption?.name).toBe("Neugier");
    expect(resolved.advantages).toHaveLength(0);
    expect(resolved.warnings).toHaveLength(0);
  });

  it("routes muttersprache entries to language abilities at level three", () => {
    const statBlock = createStatBlock({
      advantages: ["Muttersprache Garethi III"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.languages).toHaveLength(1);
    const language = resolved.languages[0];
    expect(language).toBeDefined();
    if (!language) {
      throw new Error("Expected language to resolve");
    }
    expect(language.option?.name).toBe("Garethi");
    expect(language.level).toBe(3);
    expect(resolved.advantages).toHaveLength(0);
    expect(resolved.warnings).toHaveLength(0);
  });

  it("strips citations before resolving special abilities", () => {
    const statBlock = createStatBlock({
      specialAbilities: ["Kernschuss I+IIAKOII128 (Bogen)"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.specialAbilities).toHaveLength(1);
    const ability = resolved.specialAbilities[0];
    expect(ability).toBeDefined();
    if (!ability) {
      throw new Error("Expected special ability to resolve");
    }
    expect(ability.source).toBe("Kernschuss II (Bogen)");
    expect(ability.match?.normalizedName).toBe("kernschuss");
    expect(ability.level).toBe(2);
    expect(resolved.warnings).toHaveLength(0);
  });

  it("collapses chained tiers to the highest level", () => {
    const statBlock = createStatBlock({
      combatSpecialAbilities: ["Wuchtschlag I+II+III"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.combatSpecialAbilities).toHaveLength(1);
    const ability = resolved.combatSpecialAbilities[0];
    expect(ability).toBeDefined();
    if (!ability) {
      throw new Error("Expected combat special ability to resolve");
    }
    expect(ability.match?.normalizedName).toBe("wuchtschlag");
    expect(ability.source).toBe("Wuchtschlag III");
    expect(ability.level).toBe(3);
    expect(resolved.warnings).toHaveLength(0);
  });

  it("maps Dämmerungssicht to Dunkelsicht advantages only", () => {
    const statBlock = createStatBlock({
      advantages: ["Dämmerungssicht II"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.advantages).toHaveLength(1);
    expect(resolved.disadvantages).toHaveLength(0);
    const advantage = resolved.advantages[0];
    expect(advantage).toBeDefined();
    if (!advantage) {
      throw new Error("Expected advantage to resolve");
    }
    expect(advantage.match?.normalizedName).toBe("dunkelsicht");
    expect(advantage.source).toBe("Dunkelsicht II");
    expect(resolved.warnings).toHaveLength(0);
  });

  it("detects standalone language entries in special abilities", () => {
    const statBlock = createStatBlock({
      specialAbilities: ["Mohisch I"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.specialAbilities).toHaveLength(0);
    expect(resolved.languages).toHaveLength(1);
    const language = resolved.languages[0];
    expect(language).toBeDefined();
    if (!language) {
      throw new Error("Expected language to resolve");
    }
    expect(language.option?.name).toBe("Mohisch");
    expect(language.level).toBe(1);
  });

  it("resolves advantages with inline tiers before option details", () => {
    const statBlock = createStatBlock({
      advantages: ["Verbesserte Regeneration I (Lebensenergie)"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.advantages).toHaveLength(1);
    const advantage = resolved.advantages[0];
    expect(advantage).toBeDefined();
    if (!advantage) {
      throw new Error("Expected advantage to resolve");
    }
    expect(advantage.match?.name).toBe(
      "Verbesserte Regeneration (Lebensenergie)",
    );
    expect(advantage.source).toBe("Verbesserte Regeneration I (Lebensenergie)");
    expect(resolved.warnings).toHaveLength(0);
  });

  it("applies fuzzy matching for minor talent typos", () => {
    const statBlock = createStatBlock({
      talents: [{ name: "Fährtensuchern", value: 13 }],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.talents).toHaveLength(1);
    const talent = resolved.talents[0];
    expect(talent).toBeDefined();
    if (!talent) {
      throw new Error("Expected talent to resolve");
    }
    expect(talent.match?.name).toBe("Fährtensuchen");
    expect(
      resolved.warnings.some(
        (warning) =>
          warning.type === "fuzzy-match" &&
          warning.section === "talents" &&
          warning.value === "Fährtensuchern",
      ),
    ).toBe(true);
  });

  it("resolves weapon entries and assigns combat techniques", () => {
    const statBlock = createStatBlock({
      weapons: [
        createWeapon({
          name: "Dolch",
          category: "melee",
          rawInput: "Dolch: AT 12 PA 8 TP 1W6+1 RW kurz",
          raw: {
            AT: "12",
            PA: "8",
            TP: "1W6+1",
            RW: "kurz",
          },
        }),
      ],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.weapons).toHaveLength(1);
    const weapon = resolved.weapons[0];
    expect(weapon).toBeDefined();
    if (!weapon) {
      throw new Error("Expected weapon to resolve");
    }
    expect(weapon.match?.normalizedName).toBe("dolch");
    expect(weapon.combatTechnique?.id).toBe("CT_3");
    expect(resolved.unresolved.weapons ?? []).toHaveLength(0);
  });

  it("maps unarmed weapons to the Raufen combat technique", () => {
    const statBlock = createStatBlock({
      weapons: [
        createWeapon({
          name: "Waffenlos",
          category: "unarmed",
        }),
      ],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.weapons).toHaveLength(1);
    const weapon = resolved.weapons[0];
    expect(weapon).toBeDefined();
    if (!weapon) {
      throw new Error("Expected weapon to resolve");
    }
    expect(weapon.fallback).toBe("unarmed");
    expect(weapon.combatTechnique?.id).toBe("CT_9");
    expect(resolved.unresolved.weapons ?? []).toHaveLength(0);
  });

  it("resolves armor entries and warns on BE mismatches", () => {
    const statBlock = createStatBlock({
      armor: createArmor({
        rs: 4,
        be: 3,
        description: "Kettenhemd",
        raw: "RS/BE 4/3 (Kettenhemd)",
      }),
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const armor = resolved.armor;
    expect(armor).not.toBeNull();
    if (!armor) {
      throw new Error("Expected armor to resolve");
    }
    expect(armor.match?.normalizedName).toBe("kettenhemd");
    expect(armor.datasetProtection).toBe(4);
    expect(armor.datasetEncumbrance).toBe(2);
    expect(
      resolved.warnings.some((warning) =>
        warning.message.includes("BE (3) weicht vom Optolith-Wert (2) ab."),
      ),
    ).toBe(true);
    expect(resolved.unresolved.armor ?? []).toHaveLength(0);
  });

  it("deduplicates unresolved warnings for repeated entries", () => {
    const statBlock = createStatBlock({
      weapons: [
        createWeapon({ name: "Improvisiertes Werkzeug" }),
        createWeapon({ name: "Improvisiertes Werkzeug" }),
      ],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.unresolved.weapons ?? []).toHaveLength(1);
    const weaponWarnings = resolved.warnings.filter(
      (warning) =>
        warning.section === "weapons" && warning.type === "unresolved",
    );
    expect(weaponWarnings).toHaveLength(1);
  });

  it("maps peitsche variants via keyword fallback", () => {
    const statBlock = createStatBlock({
      weapons: [
        createWeapon({
          name: "Entdeckerpeitsche",
          category: "melee",
        }),
      ],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.weapons).toHaveLength(1);
    const weapon = resolved.weapons[0];
    expect(weapon).toBeDefined();
    if (!weapon) {
      throw new Error("Expected weapon to resolve");
    }
    expect(weapon.match?.normalizedName).toBe("fuhrmannspeitsche");
    expect(
      resolved.warnings.some(
        (warning) =>
          warning.section === "weapons" &&
          warning.type === "fuzzy-match" &&
          warning.message.includes('Schlüsselwort "peitsche"'),
      ),
    ).toBe(true);
  });

  it("splits compound weapon names to resolve dataset entries", () => {
    const statBlock = createStatBlock({
      weapons: [
        createWeapon({
          name: "Epharit-Speer",
          category: "melee",
        }),
      ],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const weapon = resolved.weapons[0];
    expect(weapon).toBeDefined();
    if (!weapon) {
      throw new Error("Expected weapon to resolve");
    }
    expect(weapon.match?.normalizedName).toBe("speer");
    expect(
      resolved.warnings.some(
        (warning) =>
          warning.section === "weapons" &&
          warning.type === "fuzzy-match" &&
          warning.message.includes('Teilbegriff "Speer"'),
      ),
    ).toBe(true);
  });

  it("resolves equipment entries via contained item names", () => {
    const statBlock = createStatBlock({
      equipment: ["Immanschläger (Knüppel)"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.equipment).toHaveLength(1);
    const entry = resolved.equipment[0];
    expect(entry).toBeDefined();
    if (!entry) {
      throw new Error("Expected equipment entry to resolve");
    }
    expect(entry.match?.normalizedName).toBe("knuppel");
    expect(
      resolved.warnings.some(
        (warning) =>
          warning.section === "equipment" &&
          warning.type === "fuzzy-match" &&
          warning.message.includes('Teilbegriff "Knüppel"'),
      ),
    ).toBe(true);
  });

  it("suppresses armor BE mismatch when Belastungsgewöhnung applies", () => {
    const statBlock = createStatBlock({
      armor: createArmor({
        rs: 4,
        be: 0,
        description: "Kettenhemd",
        raw: "RS/BE 4/0 (Kettenhemd)",
      }),
      specialAbilities: ["Belastungsgewöhnung I"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const armor = resolved.armor;
    expect(armor).not.toBeNull();
    if (!armor) {
      throw new Error("Expected armor to resolve");
    }
    expect(armor.match?.normalizedName).toBe("kettenhemd");
    expect(armor.datasetEncumbrance).toBe(2);
    expect(
      resolved.warnings.some(
        (warning) =>
          warning.section === "armor" && warning.type === "value-mismatch",
      ),
    ).toBe(false);
  });
});
