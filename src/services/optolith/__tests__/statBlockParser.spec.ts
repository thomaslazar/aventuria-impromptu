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

  it("parses weapon lines following dash-prefixed resource markers", () => {
    const raw = `Kopfgeldjäger
MU 14 KL 12 IN 14 CH 11
FF 13 GE 14 KO 14 KK 13
LeP 36 AsP
– KaP
– INI 14+1W6
AW 7 SK 2 ZK 2 GS 7
Waffenlos: AT 16 PA 9 TP 1W6 RW kurz
Mengbilar: AT 16 PA 7 TP 1W6+1* RW kurz
Sklaventod: AT 16 PA 9 TP 1W6+4 RW mittel
Schwere Armbrust: FK 15 LZ 15 TP 2W6+6*
RW 20/100/160
RS/BE: 3/1 (Lederrüstung) (Modifikatoren durch Rüstungen bereits eingerechnet)
Vorteile/Nachteile: Schlechte Eigenschaft (Goldgier)
Sonderfertigkeiten: Armbrust überdrehenAKO151
(Schwere Armbrust), Aufmerksamkeit, Finte I (Waffenlos, Mengbilar, Sklaventod), Klinge drehenAKOII128
(Mengbilar, Sklaventod), Muttersprache Garethi III,
Ortskenntnis (Heimatdorf), Wuchtschlag I (Waffenlos, Mengbilar, Sklaventod)
Talente: Einschüchtern 10, Fährtensuchern 13, Gassenwissen 12, Handel 8, Körperbeherrschung 10, Kraftakt 10, Menschenkenntnis 12, Selbstbeherrschung 11,
Sinnesschärfe 12, Überreden 9, Verbergen 10,
Willenskraft 9
`;

    const result = parseStatBlock(raw);

    expect(result.model.weapons.map((weapon) => weapon.name)).toEqual([
      "Waffenlos",
      "Mengbilar",
      "Sklaventod",
      "Schwere Armbrust",
    ]);
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
Nachteile: Persönlichkeitsschwäche (Vorurteile gegen Nichtzwölfgöttergläubige), Arroganz
Sonderfertigkeiten: Haltegriff (Waffenlos) Schildspalter (Yeti-Keule)
Talente: Verbergen 8**
Segnungen: die Zwölf Segnungen
Zauber: Attributo (KK) 8, Analys 12, Odem 10, Zauberklinge 7, Corpofrigo 7 (10/14/12), Paralysis 18 (Die Opfer fliehen nicht, sondern erstarren vor Furcht.)
Ausrüstung: Immanschläger, den er als Knüppel nutzt, drei Speere, vier Wurfkeulen, Shakagra-Krummsäbel (2)
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
    expect(result.model.equipment).toContain("Speere");
    expect(result.model.equipment).toContain("Wurfkeulen");
    expect(result.model.equipment).toContain("Shakagra-Krummsäbel");
    expect(result.model.spells).toEqual([
      { name: "Attributo (Körperkraft)", value: 8 },
      { name: "Analys", value: 12 },
      { name: "Odem", value: 10 },
      { name: "Zauberklinge", value: 7 },
      { name: "Corpofrigo", value: 7 },
      { name: "Paralysis", value: 18 },
    ]);
    expect(result.model.blessings).toContain("die Zwölf Segnungen");
    expect(result.model.disadvantages).toContain(
      "Persönlichkeitsschwäche (Vorurteile gegen Nichtzwölfgöttergläubige)",
    );
  });

  it("parses categorized talents, blessings, and equipment measurements", () => {
    const raw = `Fildorn von den Inseln
MU 13 KL 12 IN 14 CH 13
FF 14 GE 14 KO 10 KK 10
LeP 25 SK 2 AsP – ZK 0
KaP 34 AW 8 GS 8 INI 14+1W6
Sprachen: Bosparano II, Garethi III, Tulamidya I
Schriften: Kusliker Zeichen
Vorteile: Geweihter
Talente:
Körper: Klettern (Fassadenklettern) 7, Körperbeherrschung 6
Gesellschaft: Gassenwissen 6, Überreden 7
Handwerk: Schlösserknacken 8
Segnungen: Zwölf Segnungen
Ausrüstung: Dietrichsets, 10 Schritt Seil, Wurfhaken
`;

    const result = parseStatBlock(raw);

    expect(result.model.languages).toEqual([
      "Bosparano II",
      "Garethi III",
      "Tulamidya I",
    ]);
    expect(result.model.scripts).toEqual(["Kusliker Zeichen"]);
    expect(result.model.advantages).toContain("Geweihter");
    const talentNames = result.model.talents.map((entry) => entry.name);
    expect(talentNames).toEqual(
      expect.arrayContaining([
        "Klettern (Fassadenklettern)",
        "Körperbeherrschung",
        "Gassenwissen",
        "Überreden",
        "Schlösserknacken",
      ]),
    );
    const klettern = result.model.talents.find(
      (talent) => talent.name === "Klettern (Fassadenklettern)",
    );
    expect(klettern?.value).toBe(7);
    expect(result.model.blessings).toContain("Zwölf Segnungen");
    expect(result.model.equipment).toContain("Kletterseil, pro Schritt (10 m)");
  });

  it("captures combat technique ratings when present", () => {
    const raw = `Arn Knokenbreeker
MU 13 KL 9 IN 13 CH 13
FF 12 GE 15 KO 14 KK 16
LeP 40 SK 1 AsP – ZK 3
KaP – AW 7 GS 8 INI 14+1W6
Schriften: Kusliker Zeichen
Kampftechniken: Hiebwaffen 14, Raufen 14
Waffenlos: AT 15 PA 9 TP 1W6+2 RW kurz
Knüppel: AT 15 PA 7 TP 1W6+4 RW mittel
RS/BE 0/ 0
Vorteile: Zäher Hund
Nachteile: Schlechte Eigenschaft (Jähzorn)
Talente: Körperbeherrschung 11, Kraftakt 13`;

    const result = parseStatBlock(raw);

    expect(result.model.combatTechniques).toEqual(
      expect.arrayContaining([
        { name: "Hiebwaffen", value: 14 },
        { name: "Raufen", value: 14 },
      ]),
    );
    expect(result.model.scripts).toContain("Kusliker Zeichen");
  });
});
