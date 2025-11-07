import { describe, expect, it } from "vitest";

import { createDatasetLookups } from "../dataset";
import { exportToOptolithCharacter } from "../exporter";
import { resolveStatBlock } from "../resolver";
import { parseStatBlock } from "../statBlockParser";

import { loadDataset, loadSample } from "./helpers";

describe("exportToOptolithCharacter", () => {
  it("exports a structured character for Notia", async () => {
    const dataset = await loadDataset();
    const lookups = createDatasetLookups(dataset);
    const raw = await loadSample("notia-botero-montez");
    const parsed = parseStatBlock(raw);
    const resolved = resolveStatBlock(parsed.model, lookups);

    const { hero, warnings } = exportToOptolithCharacter({
      dataset: lookups,
      parsed,
      resolved,
    });

    expect(hero.name).toBe("Notia Botero-Montez");
    expect(hero.locale).toBe(dataset.manifest.locale);
    expect(hero.activatable.SA_29?.length).toBeGreaterThan(0);
    expect(Object.keys(hero.talents)).not.toHaveLength(0);
    expect(hero.sex).toBe("m");
    expect(hero.pers.family).toBe("Unbekannt");
    expect(warnings.length).toBeGreaterThanOrEqual(0);
    expect(hero.ct).toBeDefined();
  });

  it("includes resolved weapons, armor, and equipment in belongings", async () => {
    const dataset = await loadDataset();
    const lookups = createDatasetLookups(dataset);
    const raw = await loadSample("stammeskriegerin-napewanha");
    const parsed = parseStatBlock(raw);
    const resolved = resolveStatBlock(parsed.model, lookups);

    const { hero } = exportToOptolithCharacter({
      dataset: lookups,
      parsed,
      resolved,
    });

    const belongingsItems = Object.values(hero.belongings.items);
    const expectedCount =
      resolved.weapons.filter((weapon) => weapon.match).length +
      (resolved.armor?.match ? 1 : 0) +
      resolved.equipment.filter((entry) => entry.match).length;

    expect(belongingsItems).toHaveLength(expectedCount);

    resolved.weapons
      .filter((weapon) => weapon.match)
      .forEach((weapon) => {
        expect(
          belongingsItems.some(
            (item) =>
              (item as { template?: string }).template === weapon.match!.id,
          ),
        ).toBe(true);
      });

    if (resolved.armor?.match) {
      expect(
        belongingsItems.some(
          (item) =>
            (item as { template?: string }).template ===
            resolved.armor!.match!.id,
        ),
      ).toBe(true);
    }

    const firstItem = hero.belongings.items["ITEM_1"] as Record<
      string,
      unknown
    >;
    expect(firstItem?.isTemplateLocked).toBe(true);
    expect(firstItem?.template).toBeDefined();
    expect(firstItem?.name).toBeDefined();
    expect(hero.ct["CT_9"]).toBeGreaterThanOrEqual(6);
  });

  it("derives combat technique values from weapon stats", async () => {
    const dataset = await loadDataset();
    const lookups = createDatasetLookups(dataset);
    const raw = `Kopfgeldjäger
MU 14 KL 12 IN 14 CH 11
FF 13 GE 14 KO 14 KK 13
LeP 36 AsP
- KaP
- INI 14+1W6
AW 7 SK 2 ZK 2 GS 7
Waffenlos: AT 16 PA 9 TP 1W6 RW kurz
Mengbilar: AT 16 PA 7 TP 1W6+1* RW kurz
Sklaventod: AT 16 PA 9 TP 1W6+4 RW mittel
Schwere Armbrust: FK 15 LZ 15 TP 2W6+6*
RW 20/100/160
RS/BE: 3/1 (Lederrüstung) (Modifikatoren durch Rüstungen bereits eingerechnet)
Vorteile/Nachteile: Schlechte Eigenschaft (Goldgier)`;

    const parsed = parseStatBlock(raw);
    const resolved = resolveStatBlock(parsed.model, lookups);

    const { hero, warnings } = exportToOptolithCharacter({
      dataset: lookups,
      parsed,
      resolved,
    });

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining("specialAbilities"),
        expect.stringContaining("talents"),
      ]),
    );
    expect(hero.ct).toMatchObject({
      CT_1: 14,
      CT_3: 14,
      CT_9: 14,
      CT_12: 14,
    });
  });

  it("uses manual combat technique entries when available", async () => {
    const dataset = await loadDataset();
    const lookups = createDatasetLookups(dataset);
    const raw = `Test-Borscher
MU 12 KL 10 IN 11 CH 9
FF 10 GE 12 KO 11 KK 12
LeP 30 AsP - KaP - INI 12+1W6
AW 6 SK 1 ZK 1 GS 7
Kampftechniken: Hiebwaffen 14, Raufen 12
Vorteile: keine
Nachteile: keine
Sonderfertigkeiten: keine
Talente: Klettern 5
`;

    const parsed = parseStatBlock(raw);
    const resolved = resolveStatBlock(parsed.model, lookups);

    const { hero } = exportToOptolithCharacter({
      dataset: lookups,
      parsed,
      resolved,
    });

    expect(hero.ct).toMatchObject({
      CT_5: 14,
      CT_9: 12,
    });
  });
});
