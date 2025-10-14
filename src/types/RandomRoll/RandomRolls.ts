import type { LocalizedText } from "@/i18n/localizedText";
import { Dice } from "../Dice";
import type { IRandomRoll, RollMeta } from "../interfaces/IRandomRoll";
import type { IRandomRolls, RollOutcome } from "../interfaces/IRandomRolls";

export class RandomRolls implements IRandomRolls {
  description: LocalizedText | null;
  diceType: number;
  rolls: IRandomRoll[];
  private readonly tableKey: string;

  constructor(
    tableKey: string,
    description: LocalizedText | null,
    diceType = 20,
    rolls: IRandomRoll[],
  ) {
    this.tableKey = tableKey;
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

        const meta: RollMeta | undefined = {
          ...roll.meta,
          tableKey: roll.meta?.tableKey ?? this.tableKey,
        };

        result.push({
          description: this.description,
          result: resolvedResult,
          meta,
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
