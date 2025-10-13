import type { IRandomRolls } from "./IRandomRolls";

export type RollResult = string | null | (() => string | null);

export interface IRandomRoll {
  rollChance: number[];
  result: RollResult;
  followupRolls: IRandomRolls[] | null;
}
