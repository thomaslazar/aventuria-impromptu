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
    combatTechniques: [],
    scripts: [],
    advantages: [],
    disadvantages: [],
    specialAbilities: [],
    combatSpecialAbilities: [],
    languages: [],
    cantrips: [],
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

  it("maps Dämmerungssicht and Dunkesicht variants to Dunkelsicht advantages only", () => {
    const statBlock = createStatBlock({
      advantages: ["Dämmerungssicht II", "Dunkesicht"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.advantages).toHaveLength(2);
    expect(resolved.disadvantages).toHaveLength(0);
    const daemmerung = resolved.advantages.find((entry) =>
      entry.source.startsWith("Dunkelsicht"),
    );
    expect(daemmerung).toBeDefined();
    if (!daemmerung) {
      throw new Error("Expected advantage to resolve");
    }
    expect(daemmerung.match?.normalizedName).toBe("dunkelsicht");
    expect(daemmerung.source).toBe("Dunkelsicht II");

    const typoEntry = resolved.advantages.find(
      (entry) => entry.source === "Dunkelsicht",
    );
    expect(typoEntry?.match?.normalizedName).toBe("dunkelsicht");

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

  it("emits a single warning for natural armor without description", () => {
    const statBlock = createStatBlock({
      armor: createArmor({
        rs: 1,
        be: 0,
        raw: "RS/BE 1/0",
      }),
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const armor = resolved.armor;
    expect(armor).not.toBeNull();
    if (!armor) {
      throw new Error("Expected armor to resolve");
    }
    expect(armor.isNaturalArmor).toBe(true);
    const armorWarnings = resolved.warnings.filter(
      (warning) => warning.section === "armor",
    );
    expect(armorWarnings).toHaveLength(1);
    expect(armorWarnings[0]?.message).toContain("natürlicher Rüstungsschutz");
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
      (warning) => warning.section === "weapons",
    );
    expect(weaponWarnings).toHaveLength(0);
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

  it("handles personality weaknesses, relative clauses, tradition naming, and blessing aggregates", () => {
    const statBlock = createStatBlock({
      disadvantages: [
        "Persönlichkeitsschwäche (Vorurteile gegen Nichtzwölfgöttergläubige)",
      ],
      equipment: ["Immanschläger, den er als Knüppel nutzt"],
      specialAbilities: ["Tradition (Praiosgeweihte)"],
      blessings: ["die Zwölf Segnungen"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const disadvantage = resolved.disadvantages[0];
    expect(disadvantage?.match?.normalizedName).toBe(
      "personlichkeitsschwachen",
    );

    const equipment = resolved.equipment[0];
    expect(equipment?.match?.normalizedName).toBe("knuppel");

    const tradition = resolved.specialAbilities[0];
    expect(tradition?.match?.normalizedName).toBe("tradition praioskirche");

    const expectedBlessingCount = lookups.blessings.byId.size;
    expect(resolved.blessings).toHaveLength(expectedBlessingCount);
    const blessingNames = new Set(
      resolved.blessings
        .map((entry) => entry.match?.normalizedName)
        .filter((name): name is string => Boolean(name)),
    );
    expect(blessingNames.size).toBe(expectedBlessingCount);
    expect(blessingNames.has("eidsegen")).toBe(true);
    expect(resolved.unresolved.blessings ?? []).toHaveLength(0);
  });

  it("normalizes talent applications and equipment aliases", () => {
    const statBlock = createStatBlock({
      talents: [
        { name: "Klettern (Fassadenklettern)", value: 7 },
        { name: "Götter & Kulte (Phex)", value: 6 },
      ],
      equipment: ["Dietrichsets", "Seil (10 m)"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const talentNames = resolved.talents
      .map((talent) => talent.match?.normalizedName)
      .filter((name): name is string => Boolean(name));
    expect(talentNames).toEqual(
      expect.arrayContaining(["klettern", "gotter kulte"]),
    );

    const equipmentNames = resolved.equipment
      .map((entry) => entry.match?.normalizedName)
      .filter((name): name is string => Boolean(name));
    expect(equipmentNames).toEqual(
      expect.arrayContaining(["dietrich", "kletterseil pro schritt"]),
    );

    expect(resolved.unresolved.talents ?? []).toHaveLength(0);
    expect(resolved.unresolved.equipment ?? []).toHaveLength(0);
  });

  it("splits special abilities joined by 'oder' and warns about duplication", () => {
    const statBlock = createStatBlock({
      specialAbilities: ["Finte I oder Wuchtschlag I"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const names = resolved.specialAbilities
      .map((entry) => entry.match?.normalizedName)
      .filter((name): name is string => Boolean(name));
    expect(names).toEqual(
      expect.arrayContaining([
        expect.stringContaining("finte"),
        expect.stringContaining("wuchtschlag"),
      ]),
    );
    expect(
      resolved.warnings.some(
        (warning) =>
          warning.type === "split" &&
          warning.section === "specialAbilities" &&
          warning.message.includes("Finte I oder Wuchtschlag I"),
      ),
    ).toBe(true);
  });

  it("interprets Angst vor entries with levels and overrides", () => {
    const statBlock = createStatBlock({
      disadvantages: ["Angst vor Toten II"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const phobia = resolved.disadvantages.find(
      (entry) => entry.match?.normalizedName === "angst vor",
    );
    expect(phobia).toBeDefined();
    expect(phobia?.selectOption?.name).toBe("Toten und Untoten");
    expect(phobia?.level).toBe(2);
    expect(resolved.unresolved.disadvantages ?? []).toHaveLength(0);
  });

  it("maps Prinzipientreue details to Moralkodex entries", () => {
    const statBlock = createStatBlock({
      disadvantages: ["Prinzipientreue I (Phexkirche)"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const principle = resolved.disadvantages.find(
      (entry) => entry.match?.normalizedName === "prinzipientreue",
    );
    expect(principle).toBeDefined();
    expect(principle?.level).toBe(1);
    expect(principle?.selectOption?.name).toBe("Moralkodex der Phexkirche");
  });

  it("expands Verpflichtungen entries into canonical obligations", () => {
    const statBlock = createStatBlock({
      disadvantages: ["Verpflichtungen II (Tempel, Kirche)"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const obligationOptions = resolved.disadvantages
      .filter((entry) => entry.match?.normalizedName === "verpflichtungen")
      .map((entry) => entry.selectOption?.name)
      .filter((name): name is string => Boolean(name));
    expect(obligationOptions).toEqual(
      expect.arrayContaining([
        "Geweihter gegenüber seinem Tempel",
        "Geweihter gegenüber seiner Kirche",
      ]),
    );
    resolved.disadvantages
      .filter((entry) => entry.match?.normalizedName === "verpflichtungen")
      .forEach((entry) => expect(entry.level).toBe(2));
    expect(resolved.unresolved.disadvantages ?? []).toHaveLength(0);
  });

  it("matches clothing variants without generating armor warnings", () => {
    const statBlock = createStatBlock({
      armor: createArmor({
        rs: 0,
        be: 0,
        description: "normale Kleidung oder nackt",
        raw: "RS/BE 0/0 normale Kleidung oder nackt",
      }),
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const armor = resolved.armor;
    expect(armor).toBeNull();
    expect(
      resolved.warnings.some(
        (warning) =>
          warning.section === "armor" && warning.type === "unresolved",
      ),
    ).toBe(false);
  });

  it("resolves immunity advantages and personality weakness options", () => {
    const statBlock = createStatBlock({
      advantages: ["Immunität gegen Zorganpocken"],
      disadvantages: ["Arroganz"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const immunity = resolved.advantages.find((entry) =>
      entry.source.startsWith("Immunität gegen"),
    );
    expect(immunity?.match?.normalizedName).toBe("immunitat gegen");

    const weakness = resolved.disadvantages.find((entry) =>
      entry.source.includes("Arroganz"),
    );
    expect(weakness?.source).toBe("Persönlichkeitsschwächen (Arroganz)");
    expect(weakness?.match?.normalizedName).toBe("personlichkeitsschwachen");
  });

  it("interprets hyphenated ability tiers and option splits", () => {
    const statBlock = createStatBlock({
      specialAbilities: ["Beidhändiger Kampf I-II", "Finte I-II"],
      combatSpecialAbilities: [
        "Wuchtschlag I-III (Waffenlos, Yeti-Keule)",
        "Verbessertes Ausweichen I-III",
      ],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const dualWield = resolved.specialAbilities.find((entry) =>
      entry.source.startsWith("Beidhändiger Kampf"),
    );
    expect(dualWield?.level).toBe(2);

    const finte = resolved.specialAbilities.find((entry) =>
      entry.source.startsWith("Finte"),
    );
    expect(finte?.level).toBe(2);

    const wuchtschlag = resolved.combatSpecialAbilities.find((entry) =>
      entry.source.startsWith("Wuchtschlag"),
    );
    expect(wuchtschlag?.level).toBe(3);

    const ausweichen = resolved.combatSpecialAbilities.find((entry) =>
      entry.source.startsWith("Verbessertes Ausweichen"),
    );
    expect(ausweichen?.level).toBe(3);
  });

  it("splits Angst vor entries with nested lists", () => {
    const statBlock = createStatBlock({
      disadvantages: ["Angst vor (… (Feuer, Luchsen))"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(
      resolved.disadvantages.some(
        (entry) => entry.source === "Angst vor (Feuer)",
      ),
    ).toBe(true);
    expect(
      resolved.disadvantages.some(
        (entry) => entry.source === "Angst vor (Luchsen)",
      ),
    ).toBe(true);
  });

  it("normalizes shorthand spells to canonical entries", () => {
    const statBlock = createStatBlock({
      spells: [
        { name: "Analys", value: 12 },
        { name: "Odem", value: 10 },
        { name: "Zauberklinge", value: 7 },
      ],
    });

    const resolved = resolveStatBlock(statBlock, lookups);
    const spellNames = resolved.spells
      .map((spell) => spell.match?.normalizedName)
      .filter((name): name is string => Boolean(name));

    expect(spellNames).toContain("analys arkanstruktur");
    expect(spellNames).toContain("odem arcanum");
    expect(spellNames).toContain("zauberklinge geisterspeer");
  });

  it("maps equipment quantities and keywords to canonical gear", () => {
    const statBlock = createStatBlock({
      equipment: [
        "drei Speere",
        "vier Wurfkeulen",
        "Giftdolch",
        "Shakagra-Krummsäbel (2)",
        "Leichte Shakagra-Platte",
        "Shakagra-Langschild",
      ],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const speer = resolved.equipment.find(
      (entry) => entry.match?.normalizedName === "speer",
    );
    expect(speer?.normalizedSource).toBe("speere");

    const wurfkeule = resolved.equipment.find(
      (entry) => entry.match?.normalizedName === "wurfkeule",
    );
    expect(wurfkeule?.normalizedSource).toBe("wurfkeulen");

    const dolch = resolved.equipment.find(
      (entry) => entry.match?.normalizedName === "dolch",
    );
    expect(dolch?.normalizedSource).toBe("giftdolch");

    const saebel = resolved.equipment.find(
      (entry) => entry.match?.normalizedName === "sabel",
    );
    expect(saebel?.normalizedSource).toBe("shakagra krummsabel");

    const plattenrustung = resolved.equipment.find(
      (entry) => entry.match?.normalizedName === "plattenrustung",
    );
    expect(plattenrustung?.normalizedSource).toBe("leichte shakagra platte");

    const grossschild = resolved.equipment.find(
      (entry) => entry.match?.normalizedName === "gro schild",
    );
    expect(grossschild?.normalizedSource).toBe("shakagra langschild");
  });

  it("splits multi-option abilities and links liturgical references", () => {
    const statBlock = createStatBlock({
      specialAbilities: [
        "Berufsgeheimnis (Antidot, Heiltrank, Sunsura)",
        "Ortskenntnis (Dracoras, Altstadt und Hafenviertel in Vinsalt, Neustadt in Havena, Sulhaminiah in Zorgan)",
        "Lieblingsliturgie (Maske)",
        "Merkmalskenntnis (Heilung und Telekinese)",
      ],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const tradeSecrets = resolved.specialAbilities.filter((entry) =>
      entry.source.startsWith("Berufsgeheimnis"),
    );
    expect(tradeSecrets).toHaveLength(3);
    expect(
      tradeSecrets.map((entry) => entry.selectOption?.name),
    ).toEqual(
      expect.arrayContaining(["Antidot", "Heiltrank", "Sunsura"]),
    );

    const localKnowledge = resolved.specialAbilities.filter((entry) =>
      entry.source.startsWith("Ortskenntnis"),
    );
    expect(localKnowledge).toHaveLength(4);
    expect(localKnowledge.map((entry) => entry.source)).toEqual(
      expect.arrayContaining([
        "Ortskenntnis (Dracoras)",
        "Ortskenntnis (Altstadt und Hafenviertel in Vinsalt)",
        "Ortskenntnis (Neustadt in Havena)",
        "Ortskenntnis (Sulhaminiah in Zorgan)",
      ]),
    );

    const favoriteLiturgy = resolved.specialAbilities.find((entry) =>
      entry.source.startsWith("Lieblingsliturgie"),
    );
    expect(favoriteLiturgy?.linkedOption?.type).toBe("LiturgicalChant");
    expect(favoriteLiturgy?.linkedOption?.value).toBe(97);

    const knowledgeEntries = resolved.specialAbilities.filter((entry) =>
      entry.source.startsWith("Merkmalskenntnis"),
    );
    expect(knowledgeEntries).toHaveLength(2);
    expect(
      knowledgeEntries.map((entry) => entry.selectOption?.name),
    ).toEqual(expect.arrayContaining(["Heilung", "Telekinese"]));
  });

  it("expands equipment packages into individual items", () => {
    const statBlock = createStatBlock({
      equipment: ["Wildnis-Paket"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.equipment.length).toBeGreaterThan(1);
    expect(
      resolved.equipment.some((entry) =>
        entry.source.includes("Kletterseil"),
      ),
    ).toBe(true);
    const rope = resolved.equipment.find(
      (entry) => entry.match?.id === "ITEMTPL_219",
    );
    expect(rope?.quantityHint).toBe(10);
    const provisions = resolved.equipment.find(
      (entry) => entry.match?.id === "ITEMTPL_181",
    );
    expect(provisions?.quantityHint).toBe(5);
    expect(
      resolved.warnings.some(
        (warning) =>
          warning.section === "equipment" &&
          warning.message.includes("Ausrüstungspaket"),
      ),
    ).toBe(true);
  });

  it("splits Prinzipientreue entries per principle", () => {
    const statBlock = createStatBlock({
      disadvantages: ["Prinzipientreue I (Völkerverständigung, Friedfertigkeit)"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const entries = resolved.disadvantages.filter((entry) =>
      entry.source.startsWith("Prinzipientreue"),
    );
    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.source)).toEqual(
      expect.arrayContaining([
        "Prinzipientreue I (Völkerverständigung)",
        "Prinzipientreue I (Friedfertigkeit)",
      ]),
    );
  });

  it("splits Merkmalskenntnisse entries into individual selections", () => {
    const statBlock = createStatBlock({
      specialAbilities: ["Merkmalskenntnis (Heilung und Telekinese)"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const entries = resolved.specialAbilities.filter((entry) =>
      entry.source.startsWith("Merkmalskenntnis"),
    );
    expect(entries).toHaveLength(2);
    expect(
      entries.map((entry) => entry.selectOption?.name),
    ).toEqual(expect.arrayContaining(["Heilung", "Telekinese"]));
  });

  it("expands equipment packages into individual items", () => {
    const statBlock = createStatBlock({
      equipment: ["Wildnis-Paket"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.equipment.length).toBeGreaterThan(1);
    expect(
      resolved.equipment.some((entry) =>
        entry.source.includes("Kletterseil"),
      ),
    ).toBe(true);
    expect(
      resolved.warnings.some(
        (warning) =>
          warning.section === "equipment" &&
          warning.message.includes("Ausrüstungspaket"),
      ),
    ).toBe(true);
  });

  it("splits Prinzipientreue entries per principle", () => {
    const statBlock = createStatBlock({
      disadvantages: ["Prinzipientreue I (Völkerverständigung, Friedfertigkeit)"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const entries = resolved.disadvantages.filter((entry) =>
      entry.source.startsWith("Prinzipientreue"),
    );
    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.source)).toEqual(
      expect.arrayContaining([
        "Prinzipientreue I (Völkerverständigung)",
        "Prinzipientreue I (Friedfertigkeit)",
      ]),
    );
  });

  it("resolves Zaubertricks via the cantrip lookup", () => {
    const statBlock = createStatBlock({
      cantrips: ["Schlangenhände", "Trocken"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.cantrips).toHaveLength(2);
    const ids = resolved.cantrips
      .map((entry) => entry.match?.id)
      .filter((id): id is string => Boolean(id));
    expect(ids).toContain("CANTRIP_9");
    expect(ids).toContain("CANTRIP_12");
  });

  it("resolves spell entries that include descriptive parentheses", () => {
    const statBlock = createStatBlock({
      spells: [{ name: "Axxeleratus (Elfen)", value: 14 }],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.spells).toHaveLength(1);
    expect(resolved.spells[0]?.match?.normalizedName).toBe("axxeleratus");
  });

  it("resolves slash-based abilities without splitting when a canonical entry exists", () => {
    const statBlock = createStatBlock({
      specialAbilities: ["Präziser Schuss/Wurf I (Blasrohr)"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.specialAbilities).toHaveLength(1);
    const ability = resolved.specialAbilities[0];
    expect(ability?.match).toBeDefined();
    expect(
      resolved.warnings.some(
        (warning) =>
          warning.type === "split" &&
          warning.value?.includes("Präziser Schuss/Wurf"),
      ),
    ).toBe(false);
  });

  it("warns when KaP is present without Tradition or Geweihter", () => {
    const statBlock = createStatBlock({
      pools: { kap: 5 },
      advantages: [],
      specialAbilities: [],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(
      resolved.warnings.some((warning) =>
        warning.message.includes(
          "KaP auf, aber keine geweihte Tradition oder Geweihter-Vorteil",
        ),
      ),
    ).toBe(true);
  });

  it("suppresses KaP warnings when Geweihter advantage is present", () => {
    const statBlock = createStatBlock({
      pools: { kap: 5 },
      advantages: ["Geweihter"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(
      resolved.warnings.some((warning) =>
        warning.message.includes(
          "KaP auf, aber keine geweihte Tradition oder Geweihter-Vorteil",
        ),
      ),
    ).toBe(false);
  });

  it("maps Oloargh entries to the canonical Oloarkh language", () => {
    const statBlock = createStatBlock({
      languages: ["Oloargh I"],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    expect(resolved.languages).toHaveLength(1);
    expect(resolved.languages[0]?.option?.name).toBe("Oloarkh");
  });

  it("interprets Shakara-Hammer as Kriegshammer", () => {
    const statBlock = createStatBlock({
      weapons: [
        createWeapon({
          name: "Shakara-Hammer",
          category: "melee",
        }),
      ],
    });

    const resolved = resolveStatBlock(statBlock, lookups);

    const weapon = resolved.weapons[0];
    expect(weapon?.match?.normalizedName).toBe("kriegshammer");
    expect(
      resolved.warnings.some(
        (warning) =>
          warning.section === "weapons" &&
          warning.message.includes("keine Kampftechnik"),
      ),
    ).toBe(false);
  });
});
