import { describe, expect, it } from "vitest";

import { parseStatBlock } from "../statBlockParser";
import { loadSample } from "./helpers";

describe("parseStatBlock", () => {
  it("parses Notia sample with talents and languages", async () => {
    const raw = await loadSample("notia-botero-montez");
    const result = parseStatBlock(raw);

    expect(result.model.name).toBe("Notia Botero-Montez");
    expect(result.model.attributes.MU).toBe(14);
    expect(result.model.attributes.KK).toBe(12);
    expect(result.model.pools.lep).toBe(32);
    expect(result.model.languages).toEqual([
      "Garethi",
      "Bosparano III",
      "Mohisch II",
      "Tulamidya III",
    ]);
    expect(result.model.talents).toContainEqual({ name: "Betören", value: 10 });
    expect(result.model.weapons).toHaveLength(2);
    expect(result.warnings).toHaveLength(0);
  });

  it("classifies combined advantages/disadvantages correctly", async () => {
    const raw = await loadSample("gerion-mtoto");
    const result = parseStatBlock(raw);

    expect(result.model.disadvantages).toContain(
      "Schlechte Eigenschaft (Neugier)",
    );
    expect(result.model.advantages).not.toContain(
      "Schlechte Eigenschaft (Neugier)",
    );
    expect(
      result.model.weapons.find((weapon) => weapon.name === "Wurfspeer")
        ?.category,
    ).toBe("ranged");
  });

  it("normalizes wrapped talents for Gerion sample", async () => {
    const raw = await loadSample("gerion-mtoto");
    const result = parseStatBlock(raw);

    const faehrtensuchen = result.model.talents.find(
      (talent) => talent.name === "Fährtensuchen",
    );
    expect(faehrtensuchen?.value).toBe(8);

    const koerperbeherrschung = result.model.talents.find(
      (talent) => talent.name === "Körperbeherrschung",
    );
    expect(koerperbeherrschung?.value).toBe(5);

    expect(
      result.warnings.filter((warning) => warning.section === "languages"),
    ).toHaveLength(0);
  });

  it("splits combined advantages/disadvantages and strips citations", async () => {
    const raw = await loadSample("nepi-luhan");
    const result = parseStatBlock(raw);

    expect(result.model.advantages).toContain("Richtungssinn");
    expect(result.model.disadvantages).toContain(
      "Schlechte Eigenschaft (Aberglaube)",
    );

    const distanceAbility = result.model.combatSpecialAbilities.find((entry) =>
      entry.startsWith("Auf Distanz halten I"),
    );
    expect(distanceAbility).toBeDefined();
    expect(distanceAbility).toContain("Tauchspeer");
    expect(distanceAbility).not.toMatch(/AKO/i);
  });

  it("captures liturgies and handles explicit none markers", async () => {
    const raw = await loadSample("schamane");
    const result = parseStatBlock(raw);

    expect(result.model.liturgies).toEqual([
      { name: "Hauch des Elements", value: 7 },
    ]);
    expect(result.model.advantages).toHaveLength(0);
    expect(result.model.disadvantages).toHaveLength(0);
    const armorWarning = result.warnings.find(
      (warning) => warning.section === "advantages",
    );
    expect(armorWarning).toBeUndefined();
  });

  it("normalizes common typos in talents", async () => {
    const raw = await loadSample("stammeskriegerin-napewanha");
    const result = parseStatBlock(raw);

    const senseTalent = result.model.talents.find(
      (talent) => talent.name === "Sinnesschärfe",
    );
    expect(senseTalent?.value).toBe(8);
  });
});
