#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const COLLECTED_STAT_BLOCKS = path.resolve(
  process.cwd(),
  "samples/collected-stat-blocks.md",
);
const OUTPUT_DIR = path.resolve(process.cwd(), "samples/stat-blocks");

async function main(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const content = await fs.readFile(COLLECTED_STAT_BLOCKS, "utf8");
  const blocks = content
    .split(/\n---\s*\n+/g)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map((line) => line.trim());
    const name = lines.find((line) => line.length > 0) ?? "Unknown";
    const sanitizedName = name.replace(/[\s\/\\:*?"<>|'’]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const fileName = `${sanitizedName}.txt`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    await fs.writeFile(filePath, `${block}\n`, "utf8");
    console.log(`Extracted stat block: ${fileName}`);
  }

  console.log(`Extracted ${blocks.length} stat blocks to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
