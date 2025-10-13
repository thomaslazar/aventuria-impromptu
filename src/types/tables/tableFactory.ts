import { RandomRolls } from "../RandomRoll/RandomRolls";
import type { IRandomRoll } from "../interfaces/IRandomRoll";
import type { IRandomRolls } from "../interfaces/IRandomRolls";
import type { RollResult } from "../interfaces/IRandomRoll";

export type RollResultFactory = RollResult | undefined;

export interface TableEntryConfig {
  range: string;
  result?: RollResultFactory;
  follow?: string[];
}

export interface TableConfig {
  description: string | null;
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

    const rolls: IRandomRoll[] = table.entries.map((entry) => ({
      rollChance: expandRange(entry.range),
      result: entry.result ?? null,
      followupRolls: entry.follow?.map((childKey) => build(childKey)) ?? null,
    }));

    const randomRolls = new RandomRolls(table.description, table.die, rolls);
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

export const __testUtils = {
  expandRange,
};
