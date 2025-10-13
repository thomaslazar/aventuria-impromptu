import type { IRandomRolls } from "./IRandomRolls";

export type RollResult = string | null | (() => string | null);

export interface RollMeta {
  gender?: "masculine" | "feminine" | "neuter" | "plural";
  articleStrategy?: "zum-zur";
}

export interface IRandomRoll {
  rollChance: number[];
  result: RollResult;
  meta?: RollMeta;
  followupRolls: IRandomRolls[] | null;
}
