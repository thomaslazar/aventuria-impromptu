#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  createDatasetLookups,
  type OptolithDataset,
} from "../../src/services/optolith/dataset";
import { exportToOptolithCharacter } from "../../src/services/optolith/exporter";
import { resolveStatBlock } from "../../src/services/optolith/resolver";
import { parseStatBlock } from "../../src/services/optolith/statBlockParser";

interface ConvertCliOptions {
  file?: string;
  sample?: string;
  text?: string;
  out?: string;
}

const DATASET_DIR = path.resolve(process.cwd(), "public/data/optolith");
const SAMPLE_DIR = path.resolve(process.cwd(), "samples/stat-blocks");

async function main(): Promise<void> {
  const options = parseArguments(process.argv.slice(2));
  const source = await resolveSource(options);
  const dataset = await loadDataset(DATASET_DIR);
  const lookups = createDatasetLookups(dataset);

  const parsed = parseStatBlock(source);
  const resolved = resolveStatBlock(parsed.model, lookups);
  const { hero, warnings: exportedWarnings } = exportToOptolithCharacter({
    dataset: lookups,
    parsed,
    resolved,
  });

  const payload = JSON.stringify(hero, null, 2);

  if (options.out) {
    await fs.writeFile(options.out, `${payload}\n`, "utf8");
    console.error(`Character written to ${options.out}`);
  } else {
    process.stdout.write(`${payload}\n`);
  }

  const warnings = new Set<string>(exportedWarnings);
  for (const warning of parsed.warnings) {
    warnings.add(
      `[Parser] ${warning.section ?? "general"}: ${warning.message}`,
    );
  }
  for (const warning of resolved.warnings) {
    warnings.add(`[Resolver] ${warning.section}: ${warning.message}`);
  }
  Object.entries(resolved.unresolved).forEach(([section, entries]) => {
    entries.forEach((entry) => warnings.add(`[Resolver] ${section}: ${entry}`));
  });

  if (warnings.size > 0) {
    console.error("Warnings:");
    for (const warning of warnings) {
      console.error(`- ${warning}`);
    }
  }
}

function parseArguments(args: readonly string[]): ConvertCliOptions {
  const options: ConvertCliOptions = {};
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    switch (token) {
      case "--file":
      case "-f": {
        const next = args[++index];
        if (!next) {
          throw new Error(`${token} requires a value.`);
        }
        options.file = next;
        break;
      }
      case "--sample":
      case "-s": {
        const next = args[++index];
        if (!next) {
          throw new Error(`${token} requires a sample slug.`);
        }
        options.sample = next;
        break;
      }
      case "--text":
      case "-t": {
        const next = args[++index];
        if (!next) {
          throw new Error(`${token} requires inline text.`);
        }
        options.text = next;
        break;
      }
      case "--out":
      case "-o": {
        const next = args[++index];
        if (!next) {
          throw new Error(`${token} requires an output path.`);
        }
        options.out = path.resolve(process.cwd(), next);
        break;
      }
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument ${token}. Use --help for usage.`);
    }
  }

  if (!options.file && !options.sample && !options.text) {
    throw new Error(
      "Provide --file, --sample, or --text to specify the stat block input.",
    );
  }

  return options;
}

async function resolveSource(options: ConvertCliOptions): Promise<string> {
  if (options.text) {
    return options.text;
  }
  if (options.file) {
    const absolute = path.resolve(process.cwd(), options.file);
    return fs.readFile(absolute, "utf8");
  }
  if (options.sample) {
    const samplePath = path.join(SAMPLE_DIR, `${options.sample}.txt`);
    return fs.readFile(samplePath, "utf8");
  }
  throw new Error("No input provided.");
}

function printHelp(): void {
  console.log(`Optolith Converter

Usage:
  npm run optolith:convert -- --file path/to/statblock.txt --out npc.json
  npm run optolith:convert -- --sample notia-botero-montez

Options:
  -f, --file <path>      Path to a text file containing the stat block.
  -s, --sample <slug>    Use a bundled sample from samples/stat-blocks/.
  -t, --text <value>     Provide the stat block as an inline argument.
  -o, --out <path>       Write the output JSON to the specified path.
  -h, --help             Show this message.
`);
}

async function loadDataset(rootDir: string): Promise<OptolithDataset> {
  const manifestPath = path.join(rootDir, "manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

  const readSection = async (key: string) => {
    const sectionMeta = manifest.sections.find(
      (section: { key: string }) => section.key === key,
    );
    if (!sectionMeta) {
      throw new Error(`Section ${key} missing in manifest`);
    }
    const content = await fs.readFile(
      path.join(rootDir, sectionMeta.file),
      "utf8",
    );
    return JSON.parse(content);
  };

  const [
    advantages,
    disadvantages,
    specialAbilities,
    skills,
    combatTechniques,
    spells,
    liturgies,
    blessings,
    equipment,
  ] = await Promise.all([
    readSection("advantages"),
    readSection("disadvantages"),
    readSection("specialAbilities"),
    readSection("skills"),
    readSection("combatTechniques"),
    readSection("spells"),
    readSection("liturgies"),
    readSection("blessings"),
    readSection("equipment"),
  ]);

  return {
    manifest,
    advantages,
    disadvantages,
    specialAbilities,
    skills,
    combatTechniques,
    spells,
    liturgies,
    blessings,
    equipment,
  };
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
