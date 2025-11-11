import type { OptolithDataset } from "../services/optolith/dataset";
import { createDatasetLookups } from "../services/optolith/dataset";
import { exportToOptolithCharacter } from "../services/optolith/exporter";
import { resolveStatBlock } from "../services/optolith/resolver";
import { parseStatBlock } from "../services/optolith/statBlockParser";
import type {
  ConversionErrorMessage,
  ConversionRequestMessage,
  ConversionSuccessMessage,
  EquipmentSummary,
} from "../types/optolith/converter";

let cachedDataset: ReturnType<typeof createDatasetLookups> | undefined;
let cachedManifestPath: string | undefined;

self.addEventListener(
  "message",
  async (event: MessageEvent<ConversionRequestMessage>) => {
    const message = event.data;
    if (!message || message.type !== "convert") {
      return;
    }

    try {
      const dataset = await loadDataset(message.payload.baseUrl);
      const parsed = parseStatBlock(message.payload.source);
      const resolved = resolveStatBlock(parsed.model, dataset);
      const { hero, warnings: exportedWarnings } = exportToOptolithCharacter({
        dataset,
        parsed,
        resolved,
      });
      const equipmentSummary = buildEquipmentSummary(resolved);

      const response: ConversionSuccessMessage = {
        type: "result",
        payload: {
          exported: hero,
          exportedWarnings,
          manifest: dataset.manifest,
          normalizedSource: parsed.normalizedSource,
          parserWarnings: parsed.warnings,
          resolverWarnings: resolved.warnings,
          unresolved: resolved.unresolved,
          equipmentSummary,
        },
      };

      postMessage(response);
    } catch (error) {
      const response: ConversionErrorMessage = {
        type: "error",
        error: error instanceof Error ? error.message : String(error),
      };
      postMessage(response);
    }
  },
);

async function loadDataset(baseUrl: string) {
  const manifestUrl = new URL(
    "data/optolith/manifest.json",
    baseUrl,
  ).toString();
  if (cachedDataset && cachedManifestPath === manifestUrl) {
    return cachedDataset;
  }

  const manifestResponse = await fetch(manifestUrl);
  if (!manifestResponse.ok) {
    throw new Error(
      `Manifest konnte nicht geladen werden (${manifestResponse.status})`,
    );
  }
  const manifest =
    (await manifestResponse.json()) as OptolithDataset["manifest"];

  const readSection = async (file: string) => {
    const url = new URL(`data/optolith/${file}`, baseUrl).toString();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Datensatz ${file} konnte nicht geladen werden (${response.status})`,
      );
    }
    return response.json();
  };

  const dataset: OptolithDataset = {
    manifest,
    advantages: await readSection(findSectionFile(manifest, "advantages")),
    disadvantages: await readSection(
      findSectionFile(manifest, "disadvantages"),
    ),
    specialAbilities: await readSection(
      findSectionFile(manifest, "specialAbilities"),
    ),
    skills: await readSection(findSectionFile(manifest, "skills")),
    combatTechniques: await readSection(
      findSectionFile(manifest, "combatTechniques"),
    ),
    spells: await readSection(findSectionFile(manifest, "spells")),
    cantrips: await readSection(findSectionFile(manifest, "cantrips")),
    liturgies: await readSection(findSectionFile(manifest, "liturgies")),
    blessings: await readSection(findSectionFile(manifest, "blessings")),
    equipment: await readSection(findSectionFile(manifest, "equipment")),
  };

  cachedDataset = createDatasetLookups(dataset);
  cachedManifestPath = manifestUrl;
  return cachedDataset;
}

function buildEquipmentSummary(
  resolved: ReturnType<typeof resolveStatBlock>,
): EquipmentSummary {
  const weapons = resolved.weapons.map((weapon) => ({
    name: weapon.source.name,
    templateId: weapon.match?.id,
    combatTechniqueId: weapon.combatTechnique?.id,
    fallback: weapon.fallback,
    unresolved: !weapon.match,
  }));

  const armor = resolved.armor
    ? {
        name:
          resolved.armor.source.description ??
          resolved.armor.source.notes ??
          resolved.armor.source.raw ??
          "Unknown armor",
        templateId: resolved.armor.match?.id,
        protection:
          typeof resolved.armor.datasetProtection === "number"
            ? resolved.armor.datasetProtection
            : null,
        encumbrance:
          typeof resolved.armor.datasetEncumbrance === "number"
            ? resolved.armor.datasetEncumbrance
            : null,
        unresolved: !resolved.armor.match,
      }
    : null;

  const gear = resolved.equipment.map((entry) => ({
    name: entry.source,
    templateId: entry.match?.id,
    unresolved: !entry.match,
  }));

  return {
    weapons,
    armor,
    gear,
  };
}

function findSectionFile(
  manifest: OptolithDataset["manifest"],
  key: string,
): string {
  const section = manifest.sections.find((candidate) => candidate.key === key);
  if (!section) {
    throw new Error(`Manifestabschnitt fehlt: ${key}`);
  }
  return section.file;
}
