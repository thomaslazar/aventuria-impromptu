import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { OptolithDataset } from "../../optolith/dataset";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(currentDir, "../../../../public/data/optolith");
const SAMPLE_DIR = path.resolve(currentDir, "../../../../samples/stat-blocks");

export async function loadSample(slug: string): Promise<string> {
  const filePath = path.join(SAMPLE_DIR, `${slug}.txt`);
  return readFile(filePath, "utf8");
}

export async function loadDataset(): Promise<OptolithDataset> {
  const manifest = JSON.parse(
    await readFile(path.join(DATA_DIR, "manifest.json"), "utf8"),
  );

  const readSection = async (key: string) => {
    const sectionMeta = manifest.sections.find(
      (section: { key: string }) => section.key === key,
    );
    if (!sectionMeta) {
      throw new Error(`Section ${key} missing in manifest`);
    }
    const content = await readFile(
      path.join(DATA_DIR, sectionMeta.file),
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
