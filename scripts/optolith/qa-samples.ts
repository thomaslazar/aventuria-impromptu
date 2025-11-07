import { promises as fs } from "node:fs";
import path from "node:path";

import { createDatasetLookups } from "../../src/services/optolith/dataset";
import { exportToOptolithCharacter } from "../../src/services/optolith/exporter";
import { deriveCombatTechniques } from "../../src/services/optolith/combatTechniques";
import { resolveStatBlock } from "../../src/services/optolith/resolver";
import { parseStatBlock } from "../../src/services/optolith/statBlockParser";
import type { OptolithDataset } from "../../src/services/optolith/dataset";
import type {
  ConversionResultPayload,
  EquipmentSummary,
} from "../../src/types/optolith/converter";

const DATASET_DIR = path.resolve(process.cwd(), "public/data/optolith");
const SAMPLE_MD = path.resolve(
  process.cwd(),
  "planning/intake/specs/examples/dsa5-optolith-sample-stat-blocks.md",
);
const DEFAULT_RUN_DIR = path.resolve(
  process.cwd(),
  "planning/runs/2025-10-16T12-00-00-dsa5-optolith-converter",
);

function resolveReportPath(): string {
  const override = process.env.OPTOLITH_QA_REPORT_PATH;
  if (override) {
    return path.resolve(process.cwd(), override);
  }
  const timestamp = new Date()
    .toISOString()
    .replace(/:/g, "-")
    .replace(/\..+$/, "");
  const fileName = `sample-analysis-${timestamp}.md`;
  return path.join(DEFAULT_RUN_DIR, fileName);
}

interface SampleBlock {
  readonly name: string;
  readonly text: string;
}

interface SampleReport {
  readonly sample: SampleBlock;
  readonly result: ConversionResultPayload;
  readonly combatTechniques: ReturnType<typeof deriveCombatTechniques>;
}

async function main(): Promise<void> {
  const manifest = await loadDataset(DATASET_DIR);
  const lookups = createDatasetLookups(manifest);
  const samples = await loadSamples(SAMPLE_MD);
  const reportPath = resolveReportPath();

  const reports: SampleReport[] = [];
  const failures: Array<{ sample: SampleBlock; error: string }> = [];

  for (const sample of samples) {
    try {
      const parsed = parseStatBlock(sample.text);
      const resolved = resolveStatBlock(parsed.model, lookups);
      const { hero, warnings: exportedWarnings } = exportToOptolithCharacter({
        dataset: lookups,
        parsed,
        resolved,
      });
      const equipmentSummary = buildEquipmentSummary(resolved);
      const combatTechniques = deriveCombatTechniques(
        parsed,
        resolved,
        lookups,
      );

      reports.push({
        sample,
        result: {
          exported: hero,
          exportedWarnings,
          manifest: lookups.manifest,
          normalizedSource: parsed.normalizedSource,
          parserWarnings: parsed.warnings,
          resolverWarnings: resolved.warnings,
          unresolved: resolved.unresolved,
          equipmentSummary,
        },
        combatTechniques,
      });
    } catch (error) {
      failures.push({
        sample,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await writeReport(reports, failures, reportPath);
  console.log(`QA report written to ${reportPath}`);
  if (failures.length > 0) {
    console.error(`Encountered ${failures.length} conversion errors.`);
    process.exitCode = 1;
  }
}

async function loadDataset(rootDir: string): Promise<OptolithDataset> {
  const manifest = JSON.parse(
    await fs.readFile(path.join(rootDir, "manifest.json"), "utf8"),
  ) as OptolithDataset["manifest"];

  const readSection = async (key: string) => {
    const section = manifest.sections.find(
      (candidate) => candidate.key === key,
    );
    if (!section) {
      throw new Error(`Missing manifest section ${key}`);
    }
    const content = await fs.readFile(path.join(rootDir, section.file), "utf8");
    return JSON.parse(content);
  };

  return {
    manifest,
    advantages: await readSection("advantages"),
    disadvantages: await readSection("disadvantages"),
    specialAbilities: await readSection("specialAbilities"),
    skills: await readSection("skills"),
    combatTechniques: await readSection("combatTechniques"),
    spells: await readSection("spells"),
    liturgies: await readSection("liturgies"),
    blessings: await readSection("blessings"),
    equipment: await readSection("equipment"),
  };
}

async function loadSamples(filePath: string): Promise<SampleBlock[]> {
  const content = await fs.readFile(filePath, "utf8");
  const blocks = content
    .split(/\n---\s*\n+/g)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  return blocks.map((block, index) => {
    const lines = block.split(/\r?\n/).map((line) => line.trim());
    const name = lines.find((line) => line.length > 0) ?? `Sample ${index + 1}`;
    return {
      name,
      text: block,
    };
  });
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

async function writeReport(
  reports: SampleReport[],
  failures: Array<{ sample: SampleBlock; error: string }>,
  reportPath: string,
): Promise<void> {
  const lines: string[] = [];
  lines.push("# Optolith Sample QA — 2025-10-16");
  lines.push("");
  if (failures.length > 0) {
    lines.push("## Conversion Errors");
    lines.push("");
    for (const failure of failures) {
      lines.push(`- **${failure.sample.name}** — ${failure.error}`);
    }
    lines.push("");
  }

  for (const report of reports) {
    const { sample, result, combatTechniques } = report;
    lines.push(`## ${sample.name}`);
    lines.push("");
    lines.push("### Parser Warnings");
    lines.push(
      result.parserWarnings.length > 0
        ? formatWarnings(result.parserWarnings)
        : "- None",
    );
    lines.push("");

    lines.push("### Resolver Warnings");
    lines.push(
      result.resolverWarnings.length > 0
        ? formatResolverWarnings(result.resolverWarnings)
        : "- None",
    );
    lines.push("");

    const unresolvedEntries = Object.entries(result.unresolved).filter(
      ([, items]) => items.length > 0,
    );
    lines.push("### Unresolved References");
    if (unresolvedEntries.length > 0) {
      for (const [section, entries] of unresolvedEntries) {
        lines.push(`- **${section}**: ${entries.join(", ")}`);
      }
    } else {
      lines.push("- None");
    }
    lines.push("");

    lines.push("### Exporter Warnings");
    lines.push(
      result.exportedWarnings.length > 0
        ? result.exportedWarnings.map((warning) => `- ${warning}`).join("\n")
        : "- None",
    );
    lines.push("");

    lines.push("### Combat Techniques");
    if (Object.keys(combatTechniques.values).length === 0) {
      lines.push("- None");
    } else {
      for (const detail of combatTechniques.details) {
        const ctLabel = detail.combatTechniqueName ?? detail.combatTechniqueId;
        const baseInfo =
          detail.sourceAttack !== null && detail.sourceAttack !== undefined
            ? `AT ${detail.sourceAttack}`
            : detail.sourceRangedAttack !== null &&
                detail.sourceRangedAttack !== undefined
              ? `FK ${detail.sourceRangedAttack}`
              : "Keine AT/FK-Angabe";
        lines.push(
          `- ${detail.weaponName} → ${ctLabel}: CT ${detail.derivedValue} (${baseInfo}, Attribut-Bonus ${detail.attributeBonus}, Waffenmodifikator ${detail.weaponModifier})`,
        );
      }
    }
    lines.push("");
  }

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${lines.join("\n")}\n`, "utf8");
}

function formatWarnings(
  warnings: ConversionResultPayload["parserWarnings"],
): string {
  return warnings
    .map((warning) => `- ${warning.section ?? "general"}: ${warning.message}`)
    .join("\n");
}

function formatResolverWarnings(
  warnings: ConversionResultPayload["resolverWarnings"],
): string {
  return warnings
    .map((warning) => `- ${warning.section}: ${warning.message}`)
    .join("\n");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
