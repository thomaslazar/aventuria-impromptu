#!/usr/bin/env node
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import JSZip from "jszip";
import { parse as parseYaml } from "yaml";

import {
  DerivedEntity,
  DiffEntryChange,
  OptolithDatasetManifest,
  OptolithDiffReport,
  OptolithManifestSection,
} from "../../src/types/optolith/manifest";
import { normalizeLabel } from "../../src/utils/optolith/normalizer";

const DEFAULT_ZIP_PATH =
  "planning/intake/assets/dsa5-optolith-converter/optolith-data.zip";
const DEFAULT_OUTPUT_DIR = "public/data/optolith";
const DEFAULT_LOCALE = "de-DE";
const SCHEMA_VERSION = "1.0.0";
const GENERATOR_NAME = "optolith-extractor";

interface CliOptions {
  zipPath: string;
  outputDir: string;
  locale: string;
  emitDiff: boolean;
}

interface DomainConfig {
  key: string;
  label: string;
  fileName: string;
  description?: string;
}

type AnyRecord = Record<string, unknown> & { id?: unknown };

interface PreviousSnapshot {
  readonly manifest: OptolithDatasetManifest;
  readonly sections: Record<string, DerivedEntity[]>;
}

const DOMAIN_CONFIGS: readonly DomainConfig[] = [
  {
    key: "combatTechniques",
    label: "Combat Techniques",
    fileName: "CombatTechniques.yaml",
    description:
      "Includes base data and localized labels for all combat techniques.",
  },
  {
    key: "skills",
    label: "Talents & Skills",
    fileName: "Skills.yaml",
    description:
      "Comprehensive skill catalogue with check attributes and applications.",
  },
  {
    key: "advantages",
    label: "Advantages",
    fileName: "Advantages.yaml",
    description: "All advantages with localized rules text and prerequisites.",
  },
  {
    key: "disadvantages",
    label: "Disadvantages",
    fileName: "Disadvantages.yaml",
    description:
      "All disadvantages with localized rules text and prerequisites.",
  },
  {
    key: "specialAbilities",
    label: "Special Abilities",
    fileName: "SpecialAbilities.yaml",
    description:
      "Sonderfertigkeiten including leveled and selectable options (languages, scripts, blessings).",
  },
  {
    key: "spells",
    label: "Spells",
    fileName: "Spells.yaml",
    description:
      "Magical spells with effect text, tradition metadata, and select options.",
  },
  {
    key: "liturgies",
    label: "Liturgical Chants",
    fileName: "LiturgicalChants.yaml",
    description: "Liturgies and blessings handled by the karma ruleset.",
  },
  {
    key: "blessings",
    label: "Blessings",
    fileName: "Blessings.yaml",
    description: "Standalone blessings and miracle effects.",
  },
  {
    key: "equipment",
    label: "Equipment",
    fileName: "Equipment.yaml",
    description: "Gear catalogue covering mundane equipment templates.",
  },
];

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const packageVersion = await readPackageVersion();
  await fs.mkdir(options.outputDir, { recursive: true });
  const previousSnapshot = await loadPreviousSnapshot(options.outputDir);

  const stats = await fs.stat(options.zipPath);
  if (!stats.isFile()) {
    throw new Error(
      `Expected a file at ${options.zipPath} but found something else.`,
    );
  }

  const sourceChecksum = await computeChecksum(options.zipPath);
  const zipBuffer = await fs.readFile(options.zipPath);
  const zip = await JSZip.loadAsync(zipBuffer);

  const dataset: Record<string, DerivedEntity[]> = {};
  const manifestSections: OptolithManifestSection[] = [];

  for (const domain of DOMAIN_CONFIGS) {
    const entries = await extractDomain(zip, options.locale, domain);
    dataset[domain.key] = entries;

    const sectionFileName = `${domain.key}.json`;
    const sectionPath = path.join(options.outputDir, sectionFileName);
    await writeJson(sectionPath, entries);

    manifestSections.push({
      key: domain.key,
      label: domain.label,
      file: sectionFileName,
      entryCount: entries.length,
      description: domain.description,
    });
  }

  const manifest: OptolithDatasetManifest = {
    schemaVersion: SCHEMA_VERSION,
    generatorVersion: `${GENERATOR_NAME}@${packageVersion}`,
    generatedAt: new Date().toISOString(),
    sourceChecksum,
    sourceFileName: path.basename(options.zipPath),
    sourceModifiedAt: stats.mtime.toISOString(),
    locale: options.locale,
    sections: manifestSections,
  };

  const manifestPath = path.join(options.outputDir, "manifest.json");
  await writeJson(manifestPath, manifest);

  if (options.emitDiff) {
    const diff = await buildDiffReport(previousSnapshot, dataset, manifest);
    if (diff) {
      await cleanupPreviousDiffReports(options.outputDir);
      const diffFileName = `diff-${manifest.generatedAt.replaceAll(/[:.]/g, "-")}.json`;
      await writeJson(path.join(options.outputDir, diffFileName), diff);
      logDiffSummary(diff);
    } else {
      console.info("No previous manifest found; skipping diff generation.");
    }
  }

  console.info(
    `Derived dataset written to ${options.outputDir} (checksum ${sourceChecksum.slice(0, 12)}…)`,
  );
}

function parseCliOptions(args: readonly string[]): CliOptions {
  let zipPath = DEFAULT_ZIP_PATH;
  let outputDir = DEFAULT_OUTPUT_DIR;
  let locale = DEFAULT_LOCALE;
  let emitDiff = false;

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    switch (token) {
      case "--zip":
      case "-z": {
        const next = args[++index];
        if (!next) {
          throw new Error(`${token} expects a value`);
        }
        zipPath = next;
        break;
      }
      case "--out":
      case "-o": {
        const next = args[++index];
        if (!next) {
          throw new Error(`${token} expects a value`);
        }
        outputDir = next;
        break;
      }
      case "--locale":
      case "-l": {
        const next = args[++index];
        if (!next) {
          throw new Error(`${token} expects a value`);
        }
        locale = next;
        break;
      }
      case "--diff":
        emitDiff = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(
          `Unknown argument ${token}. Run with --help for usage.`,
        );
    }
  }

  return {
    zipPath: path.resolve(process.cwd(), zipPath),
    outputDir: path.resolve(process.cwd(), outputDir),
    locale,
    emitDiff,
  };
}

function printHelp(): void {
  console.log(`${GENERATOR_NAME}

Usage:
  npm run optolith:extract -- [options]

Options:
  -z, --zip <path>       Path to the Optolith data ZIP (default: ${DEFAULT_ZIP_PATH})
  -o, --out <path>       Destination directory for the derived dataset (default: ${DEFAULT_OUTPUT_DIR})
  -l, --locale <id>      Locale to extract (default: ${DEFAULT_LOCALE})
      --diff             Emit a diff report when a previous manifest exists
  -h, --help             Show this message
`);
}

async function extractDomain(
  zip: JSZip,
  locale: string,
  domain: DomainConfig,
): Promise<DerivedEntity[]> {
  const basePath = `Data/univ/${domain.fileName}`;
  const localePath = `Data/${locale}/${domain.fileName}`;

  const baseEntries = await readYamlFile(zip, basePath);
  const localeEntries = await readYamlFile(zip, localePath);

  const mergedIds = mergeIds(baseEntries, localeEntries);
  const entries: DerivedEntity[] = [];

  for (const id of mergedIds) {
    const baseEntry = findEntry(baseEntries, id);
    const localeEntry = findEntry(localeEntries, id);

    if (!baseEntry && !localeEntry) {
      continue;
    }

    const name =
      (typeof localeEntry?.name === "string" &&
      localeEntry.name.trim().length > 0
        ? localeEntry.name.trim()
        : undefined) ??
      (typeof baseEntry?.name === "string" ? String(baseEntry.name) : id);
    const normalizedName = normalizeLabel(name);
    const synonyms = collectSynonyms(localeEntry);

    entries.push({
      id,
      name,
      normalizedName,
      base: baseEntry ?? {},
      locale: localeEntry ?? {},
      synonyms,
    });
  }

  entries.sort((left, right) => left.id.localeCompare(right.id, "en"));
  return entries;
}

function findEntry(
  entries: readonly AnyRecord[],
  id: string,
): AnyRecord | undefined {
  return entries.find((entry) => entry.id === id);
}

function mergeIds(
  baseEntries: readonly AnyRecord[],
  localeEntries: readonly AnyRecord[],
): readonly string[] {
  const ids = new Set<string>();
  for (const entry of baseEntries) {
    if (typeof entry.id === "string") {
      ids.add(entry.id);
    }
  }
  for (const entry of localeEntries) {
    if (typeof entry.id === "string") {
      ids.add(entry.id);
    }
  }
  return Array.from(ids).sort((left, right) => left.localeCompare(right, "en"));
}

async function readYamlFile(
  zip: JSZip,
  filePath: string,
): Promise<AnyRecord[]> {
  const file = zip.file(filePath);
  if (!file) {
    return [];
  }

  const content = await file.async("string");
  if (!content.trim()) {
    return [];
  }

  const parsed = parseYaml(content);
  if (!Array.isArray(parsed)) {
    throw new Error(
      `Expected an array in ${filePath} but received ${typeof parsed}`,
    );
  }

  return parsed.filter(
    (entry): entry is AnyRecord & { id: string } =>
      entry && typeof entry.id === "string",
  );
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  await fs.writeFile(filePath, serialized, "utf8");
}

async function computeChecksum(filePath: string): Promise<string> {
  const hash = createHash("sha256");
  const file = await fs.open(filePath, "r");
  try {
    const stream = file.createReadStream();
    await new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk: Buffer | string) =>
        hash.update(typeof chunk === "string" ? Buffer.from(chunk) : chunk),
      );
      stream.on("error", (error) => reject(error));
      stream.on("end", () => resolve());
    });
  } finally {
    await file.close();
  }
  return hash.digest("hex");
}

async function readPackageVersion(): Promise<string> {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  const content = await fs.readFile(packageJsonPath, "utf8");
  const parsed = JSON.parse(content) as { version?: string };
  return parsed.version ?? "0.0.0";
}

function collectSynonyms(entry: AnyRecord | undefined): string[] {
  if (!entry) {
    return [];
  }

  const synonyms = new Set<string>();

  const name = entry.name;
  if (typeof name === "string" && name.trim()) {
    synonyms.add(name.trim());
  }

  const alias = entry.alias;
  if (typeof alias === "string" && alias.trim()) {
    synonyms.add(alias.trim());
  }

  const aliases = entry.aliases;
  if (Array.isArray(aliases)) {
    for (const value of aliases) {
      if (typeof value === "string" && value.trim()) {
        synonyms.add(value.trim());
      }
    }
  }

  const specializations = entry.specializations;
  if (Array.isArray(specializations)) {
    for (const value of specializations) {
      if (typeof value === "string" && value.trim()) {
        synonyms.add(value.trim());
      }
    }
  }

  const shortName = entry.shortName;
  if (typeof shortName === "string" && shortName.trim()) {
    synonyms.add(shortName.trim());
  }

  return Array.from(synonyms);
}

async function buildDiffReport(
  previousSnapshot: PreviousSnapshot | undefined,
  dataset: Record<string, DerivedEntity[]>,
  manifest: OptolithDatasetManifest,
): Promise<OptolithDiffReport | undefined> {
  if (!previousSnapshot) {
    return undefined;
  }

  const previousManifest = previousSnapshot.manifest;
  const sections: OptolithDiffReport["sections"] = {};

  for (const section of manifest.sections) {
    const currentEntries = dataset[section.key] ?? [];
    const previousEntries = previousSnapshot.sections[section.key] ?? [];
    sections[section.key] = diffEntries(previousEntries, currentEntries);
  }

  const hasChanges = Object.values(sections).some(
    (sectionDiff) =>
      sectionDiff.added.length > 0 ||
      sectionDiff.removed.length > 0 ||
      sectionDiff.changed.length > 0,
  );

  if (!hasChanges) {
    return {
      generatedAt: manifest.generatedAt,
      sourceChecksum: manifest.sourceChecksum,
      previousChecksum: previousManifest.sourceChecksum,
      sections,
    };
  }

  return {
    generatedAt: manifest.generatedAt,
    sourceChecksum: manifest.sourceChecksum,
    previousChecksum: previousManifest.sourceChecksum,
    sections,
  };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function diffEntries(
  previousEntries: readonly DerivedEntity[],
  currentEntries: readonly DerivedEntity[],
): {
  added: readonly DiffEntryChange[];
  removed: readonly DiffEntryChange[];
  changed: readonly DiffEntryChange[];
} {
  const previousMap = new Map(
    previousEntries.map((entry) => [entry.id, entry]),
  );
  const currentMap = new Map(currentEntries.map((entry) => [entry.id, entry]));

  const added: DiffEntryChange[] = [];
  const removed: DiffEntryChange[] = [];
  const changed: DiffEntryChange[] = [];

  for (const [id, current] of currentMap.entries()) {
    if (!previousMap.has(id)) {
      added.push({ id, after: current });
      continue;
    }

    const previous = previousMap.get(id)!;
    if (!areEntitiesEqual(previous, current)) {
      changed.push({ id, before: previous, after: current });
    }
  }

  for (const [id, previous] of previousMap.entries()) {
    if (!currentMap.has(id)) {
      removed.push({ id, before: previous });
    }
  }

  return { added, removed, changed };
}

function areEntitiesEqual(left: DerivedEntity, right: DerivedEntity): boolean {
  return stableStringify(left) === stableStringify(right);
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_, innerValue) => {
    if (Array.isArray(innerValue)) {
      return innerValue;
    }
    if (innerValue && typeof innerValue === "object") {
      return Object.keys(innerValue)
        .sort()
        .reduce<Record<string, unknown>>((accumulator, key) => {
          accumulator[key] = (innerValue as Record<string, unknown>)[key];
          return accumulator;
        }, {});
    }
    return innerValue;
  });
}

function logDiffSummary(diff: OptolithDiffReport): void {
  let hasChanges = false;
  for (const [sectionKey, summary] of Object.entries(diff.sections)) {
    if (
      summary.added.length === 0 &&
      summary.removed.length === 0 &&
      summary.changed.length === 0
    ) {
      continue;
    }
    if (!hasChanges) {
      console.info("Diff summary:");
      hasChanges = true;
    }
    console.info(
      `  ${sectionKey}: +${summary.added.length} -${summary.removed.length} Δ${summary.changed.length}`,
    );
  }
  if (!hasChanges) {
    console.info("Diff summary: no changes detected.");
  }
}

async function loadPreviousSnapshot(
  outputDir: string,
): Promise<PreviousSnapshot | undefined> {
  const manifestPath = path.join(outputDir, "manifest.json");
  if (!(await fileExists(manifestPath))) {
    return undefined;
  }

  const manifestContent = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestContent) as OptolithDatasetManifest;
  const sections: Record<string, DerivedEntity[]> = {};

  for (const section of manifest.sections) {
    const sectionPath = path.join(outputDir, section.file);
    if (!(await fileExists(sectionPath))) {
      sections[section.key] = [];
      continue;
    }
    const content = await fs.readFile(sectionPath, "utf8");
    const parsed = JSON.parse(content) as DerivedEntity[];
    sections[section.key] = parsed.sort((left, right) =>
      left.id.localeCompare(right.id, "en"),
    );
  }

  return { manifest, sections };
}

async function cleanupPreviousDiffReports(outputDir: string): Promise<void> {
  const entries = await fs.readdir(outputDir);
  await Promise.all(
    entries
      .filter(
        (fileName) =>
          fileName.startsWith("diff-") && fileName.endsWith(".json"),
      )
      .map((fileName) => fs.rm(path.join(outputDir, fileName))),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
