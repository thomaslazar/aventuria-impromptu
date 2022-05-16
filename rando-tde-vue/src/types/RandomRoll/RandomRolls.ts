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

  roll(): { description: string | null; result: string|null }[] {
    const diceRoll = Dice.roll(1, this.diceType);
    console.log(diceRoll);

    let result: { description: string | null; result: string|null }[] = [];

    for (let i = 0; i < this.rolls.length; i++) {
      const roll = this.rolls[i];
      if (roll.rollChance.includes(diceRoll)) {
        result.push({ description: this.description, result: roll.result });
        if (roll.followupRolls) {
          roll.followupRolls.forEach((rolls) => {
            result = result.concat(rolls.roll());
          });
        }
        break;
      }
    }
    return result;
  }
}
