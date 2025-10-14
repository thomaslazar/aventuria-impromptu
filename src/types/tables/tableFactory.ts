import type { LocalizedText } from "@/i18n/localizedText";
import { RandomRolls } from "../RandomRoll/RandomRolls";
import type {
  IRandomRoll,
  RollMeta,
  RollResult,
} from "../interfaces/IRandomRoll";
import type { IRandomRolls } from "../interfaces/IRandomRolls";

export interface TableEntryConfig {
  range: string;
  id?: string;
  result?: RollResult;
  follow?: string[];
  meta?: RollMeta;
}

export interface TableConfig {
  description: LocalizedText | null;
  die: number;
  entries: TableEntryConfig[];
}

export type TableConfigMap = Record<string, TableConfig>;

export function buildTable(
  configs: TableConfigMap,
  rootKey: string,
): IRandomRolls {
  const cache = new Map<string, IRandomRolls>();

  const build = (key: string): IRandomRolls => {
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const table = configs[key];

    if (!table) {
      throw new Error(`Unknown table config key "${key}"`);
    }

    const rolls: IRandomRoll[] = table.entries.map((entry) => {
      const rollChance = expandRange(entry.range);
      const baseMeta = entry.meta ?? {};
      const resolvedMeta: RollMeta | undefined = {
        ...baseMeta,
        tableKey: baseMeta.tableKey ?? key,
        ...(entry.id ? { entryId: entry.id } : {}),
      };

      return {
        rollChance,
        result: entry.result ?? null,
        meta: resolvedMeta,
        followupRolls: entry.follow?.map((childKey) => build(childKey)) ?? null,
      };
    });

    ensureFullCoverage(rolls, table.die, key);

    const randomRolls = new RandomRolls(
      key,
      table.description,
      table.die,
      rolls,
    );
    cache.set(key, randomRolls);
    return randomRolls;
  };

  return build(rootKey);
}

function expandRange(rangeExpression: string): number[] {
  return rangeExpression.split(",").flatMap((segment) => {
    const trimmed = segment.trim();

    if (trimmed === "") {
      throw new Error(`Invalid empty range segment in "${rangeExpression}"`);
    }

    const [startRaw, endRaw] = trimmed.split("-").map((value) => value.trim());
    const start = Number(startRaw);
    const end = endRaw !== undefined && endRaw !== "" ? Number(endRaw) : start;

    if (Number.isNaN(start) || Number.isNaN(end)) {
      throw new Error(
        `Invalid numeric range "${trimmed}" in "${rangeExpression}"`,
      );
    }

    const min = Math.min(start, end);
    const max = Math.max(start, end);

    const values: number[] = [];
    for (let value = min; value <= max; value++) {
      values.push(value);
    }

    return values;
  });
}

function ensureFullCoverage(
  rolls: IRandomRoll[],
  dieSize: number,
  tableKey: string,
) {
  if (dieSize < 1) {
    throw new Error(
      `Invalid die size "${dieSize}" configured for table "${tableKey}"`,
    );
  }

  const coverage = new Map<number, true>();

  for (const roll of rolls) {
    for (const face of roll.rollChance) {
      if (face < 1 || face > dieSize) {
        throw new Error(
          `Roll face "${face}" from table "${tableKey}" exceeds configured die size "${dieSize}"`,
        );
      }

      if (coverage.has(face)) {
        throw new Error(
          `Duplicate roll face "${face}" detected in table "${tableKey}"`,
        );
      }

      coverage.set(face, true);
    }
  }

  const missing: number[] = [];
  for (let face = 1; face <= dieSize; face++) {
    if (!coverage.has(face)) {
      missing.push(face);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Table "${tableKey}" is missing ranges for die faces: ${missing.join(", ")}`,
    );
  }
}

export const __testUtils = {
  expandRange,
};
