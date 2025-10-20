import { beforeAll, describe, expect, it } from "vitest";

import { createDatasetLookups } from "../dataset";
import type { OptolithDatasetLookups } from "../dataset";
import { resolveStatBlock } from "../resolver";
import type { ParsedStatBlock } from "../../../types/optolith/stat-block";

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
});
