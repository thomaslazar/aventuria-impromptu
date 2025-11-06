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
  });
});
