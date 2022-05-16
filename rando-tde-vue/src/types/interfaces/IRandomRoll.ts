import type { IRandomRolls } from "./IRandomRolls";

export interface IRandomRoll {
  rollChance: number[];
  result: string | null;
  followupRolls: IRandomRolls[] | null;
}
