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

    const exported = exportToOptolithCharacter({
      dataset: lookups,
      parsed,
      resolved,
    });

    expect(exported.name).toBe("Notia Botero-Montez");
    expect(exported.locale).toBe(dataset.manifest.locale);
    expect(exported.activatable.SA_29?.length).toBeGreaterThan(0);
    expect(Object.keys(exported.talents)).not.toHaveLength(0);
    expect(exported.spells).toEqual({});
    expect(exported.warnings.length).toBeGreaterThan(0);
  });
});
