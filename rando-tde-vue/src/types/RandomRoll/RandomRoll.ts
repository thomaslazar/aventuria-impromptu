import type { IRandomRoll } from "../interfaces/IRandomRoll";
import type { IRandomRolls } from "../interfaces/IRandomRolls";

export class RandomRoll implements IRandomRoll {
  rollChance: number[];
  result: string;
  followupRolls: IRandomRolls[] | null = null;

  constructor(
    rollChance: number[],
    result: string,
    followupRolls: IRandomRolls[] | null = null,
  ) {
    this.rollChance = rollChance;
    this.result = result;
    this.followupRolls = followupRolls;
  }
}
