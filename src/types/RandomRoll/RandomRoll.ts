import type {
  IRandomRoll,
  RollResult,
  RollMeta,
} from "../interfaces/IRandomRoll";
import type { IRandomRolls } from "../interfaces/IRandomRolls";

export class RandomRoll implements IRandomRoll {
  rollChance: number[];
  result: RollResult;
  meta?: RollMeta;
  followupRolls: IRandomRolls[] | null = null;

  constructor(
    rollChance: number[],
    result: RollResult,
    meta?: RollMeta,
    followupRolls: IRandomRolls[] | null = null,
  ) {
    this.rollChance = rollChance;
    this.result = result;
    this.meta = meta;
    this.followupRolls = followupRolls;
  }
}
