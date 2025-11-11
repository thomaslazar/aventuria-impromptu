#!/usr/bin/env node
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import JSZip from "jszip";
import { parse as parseYaml } from "yaml";

import {
  DerivedEntity,
  OptolithDatasetManifest,
  OptolithManifestSection,
  OptolithManifestSectionType,
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
}

type AnyRecord = Record<string, unknown> & { id?: unknown };

interface SectionOverride {
  readonly key?: string;
  readonly label?: string;
  readonly description?: string;
}

interface SectionDescriptor {
  readonly fileName: string;
  readonly key: string;
  readonly label: string;
  readonly description?: string;
  readonly order: number;
}

type SectionExtractionResult =
  | { type: "derived"; payload: DerivedEntity[] }
  | { type: "raw"; payload: unknown };

interface AggregatedSectionState {
  entries: DerivedEntity[];
  descriptor?: SectionDescriptor;
}

const SECTION_OVERRIDES: Record<string, SectionOverride> = {
  Advantages: {
    label: "Advantages",
    description: "All advantages with localized rules text and prerequisites.",
  },
  Blessings: {
    label: "Blessings",
    description: "Standalone blessings and miracle effects.",
  },
  CombatTechniques: {
    label: "Combat Techniques",
    description:
      "Includes base data and localized labels for all combat techniques.",
  },
  Disadvantages: {
    label: "Disadvantages",
    description:
      "All disadvantages with localized rules text and prerequisites.",
  },
  Equipment: {
    label: "Equipment",
    description: "Gear catalogue covering mundane equipment templates.",
  },
  LiturgicalChants: {
    key: "liturgies",
    label: "Liturgical Chants",
    description: "Liturgies and blessings handled by the karma ruleset.",
  },
  Skills: {
    label: "Talents & Skills",
    description:
      "Comprehensive skill catalogue with check attributes and applications.",
  },
  SpecialAbilities: {
    label: "Special Abilities",
    description:
      "Sonderfertigkeiten including leveled and selectable options (languages, scripts, blessings).",
  },
  Spells: {
    label: "Spells",
    description:
      "Magical spells with effect text, tradition metadata, and select options.",
  },
};

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const packageVersion = await readPackageVersion();
  await fs.mkdir(options.outputDir, { recursive: true });

  const stats = await fs.stat(options.zipPath);
  if (!stats.isFile()) {
    throw new Error(
      `Expected a file at ${options.zipPath} but found something else.`,
    );
  }

  const sourceChecksum = await computeChecksum(options.zipPath);
  const zipBuffer = await fs.readFile(options.zipPath);
  const zip = await JSZip.loadAsync(zipBuffer);

  const sections = await discoverSections(zip, options.locale);
  const dataset: Record<string, unknown> = {};
  const manifestEntries: Array<{
    order: number;
    meta: OptolithManifestSection;
  }> = [];
  const aggregatedSections = new Map<string, AggregatedSectionState>();

  for (const section of sections) {
    const extraction = await extractSection(zip, options.locale, section);
    const aggregateTarget = getSpellAggregationTarget(section.key);

    if (aggregateTarget) {
      if (extraction.type !== "derived") {
        throw new Error(
          `Section ${section.key} must be derived to fold into ${aggregateTarget}.`,
        );
      }
      const state = aggregatedSections.get(aggregateTarget) ?? {
        entries: [],
        descriptor: undefined,
      };
      state.entries.push(...(extraction.payload as DerivedEntity[]));
      if (section.key === aggregateTarget) {
        state.descriptor = section;
      }
      aggregatedSections.set(aggregateTarget, state);
      continue;
    }

    const sectionFileName = `${section.key}.json`;
    const sectionPath = path.join(options.outputDir, sectionFileName);
    await writeJson(sectionPath, extraction.payload);
    dataset[section.key] = extraction.payload;

    manifestEntries.push({
      order: section.order,
      meta: {
        key: section.key,
        type: extraction.type,
        label: section.label,
        file: sectionFileName,
        entryCount: countEntries(extraction.payload),
        description: section.description,
      },
    });
  }

  for (const [targetKey, state] of aggregatedSections.entries()) {
    if (!state.descriptor) {
      throw new Error(
        `Missing section descriptor for aggregated target ${targetKey}.`,
      );
    }

    const mergedEntries = mergeDerivedEntryBuckets(state.entries, targetKey);
    dataset[targetKey] = mergedEntries;

    const sectionFileName = `${targetKey}.json`;
    const sectionPath = path.join(options.outputDir, sectionFileName);
    await writeJson(sectionPath, mergedEntries);

    manifestEntries.push({
      order: state.descriptor.order,
      meta: {
        key: state.descriptor.key,
        type: "derived",
        label: state.descriptor.label,
        file: sectionFileName,
        entryCount: mergedEntries.length,
        description: state.descriptor.description,
      },
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
    sections: manifestEntries
      .sort((left, right) => left.order - right.order)
      .map((entry) => entry.meta),
  };

  const manifestPath = path.join(options.outputDir, "manifest.json");
  await writeJson(manifestPath, manifest);

  console.info(
    `Derived dataset written to ${options.outputDir} (checksum ${sourceChecksum.slice(0, 12)}…)`,
  );
}

function parseCliOptions(args: readonly string[]): CliOptions {
  let zipPath = DEFAULT_ZIP_PATH;
  let outputDir = DEFAULT_OUTPUT_DIR;
  let locale = DEFAULT_LOCALE;

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
  -h, --help             Show this message
`);
}

async function extractSection(
  zip: JSZip,
  locale: string,
  section: SectionDescriptor,
): Promise<SectionExtractionResult> {
  const basePath = `Data/univ/${section.fileName}`;
  const localePath = `Data/${locale}/${section.fileName}`;

  const baseValue = await readYamlValue(zip, basePath);
  const localeValue = await readYamlValue(zip, localePath);
  const sectionType = inferSectionType(baseValue, localeValue);

  if (sectionType === "derived") {
    const baseEntries = toDerivedEntries(baseValue);
    const localeEntries = toDerivedEntries(localeValue);
    return {
      type: "derived",
      payload: buildDerivedEntries(baseEntries, localeEntries),
    };
  }

  return {
    type: "raw",
    payload: mergeRawPayload(baseValue, localeValue),
  };
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

function toDerivedEntries(value: unknown): AnyRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (entry): entry is AnyRecord & { id: string } =>
      Boolean(entry) && typeof entry.id === "string",
  );
}

function buildDerivedEntries(
  baseEntries: readonly AnyRecord[],
  localeEntries: readonly AnyRecord[],
): DerivedEntity[] {
  const mergedIds = mergeIds(baseEntries, localeEntries);
  const entries: DerivedEntity[] = [];

  for (const id of mergedIds) {
    const baseEntry = findEntry(baseEntries, id);
    const localeEntry = findEntry(localeEntries, id);

    if (!baseEntry && !localeEntry) {
      continue;
    }

    const name =
      (typeof localeEntry?.name === "string" && localeEntry.name.trim()) ||
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

async function discoverSections(
  zip: JSZip,
  locale: string,
): Promise<SectionDescriptor[]> {
  const prefix = `Data/${locale}/`;
  const fileNames = new Set<string>();

  for (const fileName of Object.keys(zip.files)) {
    if (!fileName.startsWith(prefix)) {
      continue;
    }
    if (!fileName.endsWith(".yaml")) {
      continue;
    }
    if (fileName.includes("__MACOSX")) {
      continue;
    }
    const relativeName = fileName.slice(prefix.length);
    if (SKIPPED_FILES.has(relativeName)) {
      continue;
    }
    fileNames.add(relativeName);
  }

  return Array.from(fileNames)
    .sort((left, right) => left.localeCompare(right, "en"))
    .map((fileName, index) => buildSectionDescriptor(fileName, index));
}

function buildSectionDescriptor(
  fileName: string,
  order: number,
): SectionDescriptor {
  const baseName = fileName.replace(/\.ya?ml$/i, "");
  const override = SECTION_OVERRIDES[baseName];
  const key = override?.key ?? fileNameToKey(baseName);
  const label = override?.label ?? fileNameToLabel(baseName);

  return {
    fileName,
    key,
    label,
    description: override?.description,
    order,
  };
}

function fileNameToKey(name: string): string {
  if (!name) {
    return name;
  }
  const sanitized = name.replace(/[^A-Za-z0-9]/g, "");
  if (sanitized.toUpperCase() === sanitized) {
    return sanitized.toLowerCase();
  }
  return sanitized.charAt(0).toLowerCase() + sanitized.slice(1);
}

function fileNameToLabel(name: string): string {
  if (!name) {
    return name;
  }
  if (name.toUpperCase() === name) {
    return name;
  }
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .trim();
}

function inferSectionType(
  baseValue: unknown,
  localeValue: unknown,
): OptolithManifestSectionType {
  const value = Array.isArray(localeValue) ? localeValue : baseValue;
  if (Array.isArray(value) && value.length > 0) {
    const hasIds = value.some(
      (entry) => Boolean(entry) && typeof (entry as AnyRecord).id === "string",
    );
    if (hasIds) {
      return "derived";
    }
  }
  return "raw";
}

function mergeRawPayload(baseValue: unknown, localeValue: unknown): unknown {
  if (baseValue === undefined && localeValue === undefined) {
    return null;
  }

  if (isPlainObject(baseValue) && isPlainObject(localeValue)) {
    const result: Record<string, unknown> = {};
    const keys = new Set([
      ...Object.keys(baseValue as Record<string, unknown>),
      ...Object.keys(localeValue as Record<string, unknown>),
    ]);
    for (const key of keys) {
      result[key] = mergeRawPayload(
        (baseValue as Record<string, unknown>)[key],
        (localeValue as Record<string, unknown>)[key],
      );
    }
    return result;
  }

  if (isPlainObject(localeValue)) {
    return localeValue;
  }
  if (isPlainObject(baseValue)) {
    return baseValue;
  }

  if (Array.isArray(localeValue) && Array.isArray(baseValue)) {
    return localeValue.length > 0 ? localeValue : baseValue;
  }
  if (Array.isArray(localeValue)) {
    return localeValue;
  }
  if (Array.isArray(baseValue)) {
    return baseValue;
  }

  return localeValue ?? baseValue ?? null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    (value.constructor === Object || Object.getPrototypeOf(value) === null)
  );
}

function countEntries(payload: unknown): number {
  if (Array.isArray(payload)) {
    return payload.length;
  }
  if (isPlainObject(payload)) {
    return Object.keys(payload).length;
  }
  return payload === undefined || payload === null ? 0 : 1;
}

function getSpellAggregationTarget(sectionKey: string): string | undefined {
  if (SPELL_AGGREGATION_SOURCES.has(sectionKey.toLowerCase())) {
    return SPELL_AGGREGATION_TARGET;
  }
  return undefined;
}

function mergeDerivedEntryBuckets(
  entries: readonly DerivedEntity[],
  targetKey: string,
): DerivedEntity[] {
  const byId = new Map<string, DerivedEntity>();
  for (const entry of entries) {
    if (byId.has(entry.id)) {
      throw new Error(
        `Duplicate entry id ${entry.id} encountered while folding ${targetKey}.`,
      );
    }
    byId.set(entry.id, entry);
  }
  return Array.from(byId.values()).sort((left, right) =>
    left.id.localeCompare(right.id, "en"),
  );
}

async function readYamlValue(zip: JSZip, filePath: string): Promise<unknown> {
  const file = zip.file(filePath);
  if (!file) {
    return undefined;
  }

  const content = await file.async("string");
  if (!content.trim()) {
    return undefined;
  }

  return parseYaml(content);
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

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
const SKIPPED_FILES = new Set(["UI.yaml"]);

const SPELL_AGGREGATION_TARGET = "spells";
const SPELL_AGGREGATION_SOURCES = new Set(
  [
    "animistForces",
    "curses",
    "dominationRituals",
    "elvenMagicalSongs",
    "geodeRituals",
    "magicalDances",
    "magicalMelodies",
    "rogueSpells",
    "spells",
    "zibiljaRituals",
  ].map((key) => key.toLowerCase()),
);
