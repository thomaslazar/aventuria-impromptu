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

    const rapier = result.model.weapons.find(
      (weapon) => weapon.name === "Rapier",
    );
    expect(rapier?.attack).toBe(18);
    expect(rapier?.parry).toBe(10);
    expect(rapier?.range).toBe("mittel");
    expect(rapier?.rawInput).toContain("Rapier");

    const whip = result.model.weapons.find(
      (weapon) => weapon.name === "Entdeckerpeitsche",
    );
    expect(whip?.range).toBe("lang");
    expect(whip?.attack).toBe(16);

    expect(result.model.armor?.rs).toBe(1);
    expect(result.model.armor?.be).toBe(0);
    expect(result.model.armor?.description).toBe("schwere Kleidung");
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

    const unarmed = result.model.weapons.find(
      (weapon) => weapon.name === "Waffenlos",
    );
    expect(unarmed?.category).toBe("unarmed");
    expect(result.model.armor?.rs).toBe(0);
    expect(result.model.armor?.description).toBeNull();
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

    const blowpipe = result.model.weapons.find(
      (weapon) => weapon.name === "Blasrohr",
    );
    expect(blowpipe?.rangedAttack).toBe(14);
    expect(blowpipe?.damage).toBe("1W3+1(+Gift*)");
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

    expect(result.model.armor?.rs).toBe(2);
    expect(result.model.armor?.be).toBe(0);
    expect(result.model.armor?.description).toBe("Bastrüstung");
  });

  it("parses relative clauses, composite abilities, and footnote markers", () => {
    const raw = `Testfigur
MU 10 KL 10 IN 10 CH 10
FF 10 GE 10 KO 10 KK 10
LeP 30 AsP – KaP – INI 12+1W6
AW 5 SK 0 ZK 0 GS 8
Waffenlos: AT 10 PA 7 TP 1W6 RW kurz
RS/BE: 0/0 normale Kleidung oder nackt
Vorteile: keine
Nachteile: Persönlichkeitsschwäche (Vorurteile gegen Nichtzwölfgöttergläubige)
Sonderfertigkeiten: Haltegriff (Waffenlos) Schildspalter (Yeti-Keule)
Talente: Verbergen 8**
Segnungen: die Zwölf Segnungen
Ausrüstung: Immanschläger, den er als Knüppel nutzt
`;

    const result = parseStatBlock(raw);

    expect(result.model.armor?.description).toBe("normale Kleidung oder nackt");
    expect(result.model.specialAbilities).toEqual([
      "Haltegriff (Waffenlos)",
      "Schildspalter (Yeti-Keule)",
    ]);
    const hiding = result.model.talents.find(
      (talent) => talent.name === "Verbergen",
    );
    expect(hiding?.value).toBe(8);
    expect(result.model.equipment).toContain(
      "Immanschläger, den er als Knüppel nutzt",
    );
    expect(result.model.blessings).toContain("die Zwölf Segnungen");
    expect(result.model.disadvantages).toContain(
      "Persönlichkeitsschwäche (Vorurteile gegen Nichtzwölfgöttergläubige)",
    );
  });
});
