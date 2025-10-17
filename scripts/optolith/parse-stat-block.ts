#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { parseStatBlock } from "../../src/services/optolith/statBlockParser";

interface CliOptions {
  filePath?: string;
  sample?: string;
  text?: string;
  pretty: boolean;
}

const SAMPLE_DIRECTORY = "samples/stat-blocks";

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const source = await resolveSource(options);
  const result = parseStatBlock(source);
  const output = options.pretty
    ? JSON.stringify(result, null, 2)
    : JSON.stringify(result);
  process.stdout.write(`${output}\n`);
}

function parseCliOptions(args: readonly string[]): CliOptions {
  const options: CliOptions = { pretty: true };

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    switch (token) {
      case "--file":
      case "-f": {
        const next = args[++index];
        if (!next) {
          throw new Error(`${token} erwartet einen Pfad.`);
        }
        options.filePath = next;
        break;
      }
      case "--sample":
      case "-s": {
        const next = args[++index];
        if (!next) {
          throw new Error(`${token} erwartet einen Sample-Slug.`);
        }
        options.sample = next;
        break;
      }
      case "--text":
      case "-t": {
        const next = args[++index];
        if (!next) {
          throw new Error(`${token} erwartet einen Text.`);
        }
        options.text = next;
        break;
      }
      case "--compact":
        options.pretty = false;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(
          `Unbekanntes Argument ${token}. Nutze --help für Hilfe.`,
        );
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`Stat-Block Parser

Usage:
  npm run optolith:parse -- --file <path>
  npm run optolith:parse -- --sample notia-botero-montez

Options:
  -f, --file <path>      Lies die Stat-Block-Datei von diesem Pfad.
  -s, --sample <slug>    Nutze eine Beispiel-Datei unter ${SAMPLE_DIRECTORY}.
  -t, --text <value>     Übergib den Stat-Block direkt als Parameter.
      --compact          Ausgabe als kompakte JSON-Zeile.
  -h, --help             Diese Hilfe anzeigen.
`);
}

async function resolveSource(options: CliOptions): Promise<string> {
  if (options.text) {
    return options.text;
  }
  if (options.filePath) {
    const absolutePath = path.resolve(process.cwd(), options.filePath);
    return readFile(absolutePath, "utf8");
  }
  if (options.sample) {
    const absolutePath = path.resolve(
      process.cwd(),
      SAMPLE_DIRECTORY,
      `${options.sample}.txt`,
    );
    return readFile(absolutePath, "utf8");
  }
  throw new Error(
    "Kein Eingabetext angegeben. Verwende --file, --sample oder --text.",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
