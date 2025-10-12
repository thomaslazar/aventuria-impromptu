import { Dice } from "../Dice";
import type { IRandomRoll } from "../interfaces/IRandomRoll";
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

  roll(): { description: string | null; result: string | null }[] {
    const diceRoll = Dice.roll(1, this.diceType);
    console.log(diceRoll);

    const result: { description: string | null; result: string | null }[] = [];

    for (const roll of this.rolls) {
      if (roll.rollChance.includes(diceRoll)) {
        result.push({ description: this.description, result: roll.result });
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
