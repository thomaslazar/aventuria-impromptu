import { promises as fs } from "node:fs";
import path from "node:path";

import { createDatasetLookups } from "../../src/services/optolith/dataset";
import { exportToOptolithCharacter } from "../../src/services/optolith/exporter";
import { resolveStatBlock } from "../../src/services/optolith/resolver";
import { parseStatBlock } from "../../src/services/optolith/statBlockParser";
import type { OptolithDataset } from "../../src/services/optolith/dataset";
import type { ConversionResultPayload } from "../../src/types/optolith/converter";

const DATASET_DIR = path.resolve(process.cwd(), "public/data/optolith");
const SAMPLE_MD = path.resolve(
  process.cwd(),
  "agents/project-planning/intake/specs/examples/dsa5-optolith-sample-stat-blocks.md",
);
const REPORT_PATH = path.resolve(
  process.cwd(),
  "docs/optolith/qa/sample-analysis-20251016.md",
);

interface SampleBlock {
  readonly name: string;
  readonly text: string;
}

interface SampleReport {
  readonly sample: SampleBlock;
  readonly result: ConversionResultPayload;
}

async function main(): Promise<void> {
  const manifest = await loadDataset(DATASET_DIR);
  const lookups = createDatasetLookups(manifest);
  const samples = await loadSamples(SAMPLE_MD);

  const reports: SampleReport[] = [];
  const failures: Array<{ sample: SampleBlock; error: string }> = [];

  for (const sample of samples) {
    try {
      const parsed = parseStatBlock(sample.text);
      const resolved = resolveStatBlock(parsed.model, lookups);
      const exported = exportToOptolithCharacter({ dataset: lookups, parsed, resolved });

      reports.push({
        sample,
        result: {
          exported,
          manifest: lookups.manifest,
          normalizedSource: parsed.normalizedSource,
          parserWarnings: parsed.warnings,
          resolverWarnings: resolved.warnings,
          unresolved: resolved.unresolved,
        },
      });
    } catch (error) {
      failures.push({
        sample,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await writeReport(reports, failures);
  console.log(`QA report written to ${REPORT_PATH}`);
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
    const section = manifest.sections.find((candidate) => candidate.key === key);
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

async function writeReport(
  reports: SampleReport[],
  failures: Array<{ sample: SampleBlock; error: string }>,
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
    const { sample, result } = report;
    lines.push(`## ${sample.name}`);
    lines.push("");
    lines.push("### Parser Warnings");
    lines.push(result.parserWarnings.length > 0 ? formatWarnings(result.parserWarnings) : "- None");
    lines.push("");

    lines.push("### Resolver Warnings");
    lines.push(result.resolverWarnings.length > 0 ? formatResolverWarnings(result.resolverWarnings) : "- None");
    lines.push("");

    const unresolvedEntries = Object.entries(result.unresolved).filter(([, items]) => items.length > 0);
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
    lines.push(result.exported.warnings.length > 0 ? result.exported.warnings.map((warning) => `- ${warning}`).join("\n") : "- None");
    lines.push("");
  }

  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await fs.writeFile(REPORT_PATH, `${lines.join("\n")}\n`, "utf8");
}

function formatWarnings(warnings: ConversionResultPayload["parserWarnings"]): string {
  return warnings.map((warning) => `- ${warning.section ?? "general"}: ${warning.message}`).join("\n");
}

function formatResolverWarnings(warnings: ConversionResultPayload["resolverWarnings"]): string {
  return warnings.map((warning) => `- ${warning.section}: ${warning.message}`).join("\n");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
