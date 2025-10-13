import type { IRandomRoll, RollResult } from "../interfaces/IRandomRoll";
import type { IRandomRolls } from "../interfaces/IRandomRolls";

export class RandomRoll implements IRandomRoll {
  rollChance: number[];
  result: RollResult;
  followupRolls: IRandomRolls[] | null = null;

  constructor(
    rollChance: number[],
    result: RollResult,
    followupRolls: IRandomRolls[] | null = null,
  ) {
    this.rollChance = rollChance;
    this.result = result;
    this.followupRolls = followupRolls;
  }
}
