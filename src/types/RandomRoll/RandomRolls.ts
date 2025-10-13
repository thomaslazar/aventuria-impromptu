import { Dice } from "../Dice";
import type { IRandomRoll, RollMeta } from "../interfaces/IRandomRoll";

export interface RollOutcome {
  description: string | null;
  result: string | null;
  meta?: RollMeta;
}
import type { IRandomRolls } from "../interfaces/IRandomRolls";

export class RandomRolls implements IRandomRolls {
  description: string | null;
  diceType: number;
  rolls: IRandomRoll[];

  constructor(description: string | null, diceType = 20, rolls: IRandomRoll[]) {
    this.diceType = diceType;
    this.rolls = rolls;
    this.description = description;
  }

  roll(): RollOutcome[] {
    const diceRoll = Dice.roll(1, this.diceType);

    const result: RollOutcome[] = [];

    for (const roll of this.rolls) {
      if (roll.rollChance.includes(diceRoll)) {
        const resolvedResult =
          typeof roll.result === "function" ? roll.result() : roll.result;
        result.push({
          description: this.description,
          result: resolvedResult,
          meta: roll.meta,
        });
        if (roll.followupRolls) {
          for (const followup of roll.followupRolls) {
            result.push(...followup.roll());
          }
        }
        break;
      }
    }
    return result;
  }
}
