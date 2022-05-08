import type { IRandomRoll } from "./IRandomRoll";

export interface IRandomRolls {
  description: string;
  diceType: number;
  rolls: IRandomRoll[];
  roll(): { description: string; result: string }[];
}
