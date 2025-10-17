import { describe, expect, it } from "vitest";

import { createDatasetLookups } from "../dataset";
import { resolveStatBlock } from "../resolver";
import { parseStatBlock } from "../statBlockParser";
import { loadDataset, loadSample } from "./helpers";

describe("resolveStatBlock", () => {
  it("resolves sample with languages and talents", async () => {
    const dataset = await loadDataset();
    const lookups = createDatasetLookups(dataset);
    const raw = await loadSample("notia-botero-montez");
    const parsed = parseStatBlock(raw);
    const resolved = resolveStatBlock(parsed.model, lookups);

    const languageWarnings = resolved.warnings.filter(
      (warning) =>
        warning.section === "languages" && warning.type === "unresolved",
    );
    expect(languageWarnings).toHaveLength(0);
    const talentWarnings = resolved.warnings.filter(
      (warning) =>
        warning.section === "talents" && warning.type === "unresolved",
    );
    expect(talentWarnings).toHaveLength(0);
    expect(resolved.languages).toHaveLength(4);
    for (const language of resolved.languages) {
      expect(language.match?.id).toBe("SA_29");
      const option = language.option;
      expect(option).toBeDefined();
      if (option) {
        expect(option.optionId).toBeGreaterThan(0);
      }
    }
    const betoeren = resolved.talents.find(
      (talent) => talent.source.name === "Betören",
    );
    expect(betoeren?.match?.id).toBeDefined();
  });

  it("resolves combined advantages/disadvantages with select options", async () => {
    const dataset = await loadDataset();
    const lookups = createDatasetLookups(dataset);
    const raw = await loadSample("gerion-mtoto");
    const parsed = parseStatBlock(raw);
    const resolved = resolveStatBlock(parsed.model, lookups);
    const disadvantage = resolved.disadvantages.find((entry) =>
      entry.source.startsWith("Schlechte Eigenschaft"),
    );
    expect(disadvantage?.match?.id).toBe("DISADV_37");
    expect(disadvantage?.selectOption?.name).toBe("Neugier");
    expect(disadvantage?.selectOption?.id).toBeGreaterThan(0);
    const disadvantageWarnings = resolved.warnings.filter(
      (warning) =>
        warning.section === "disadvantages" &&
        warning.value.includes("Schlechte Eigenschaft"),
    );
    expect(disadvantageWarnings).toHaveLength(0);
  });
});
