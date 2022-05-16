import type { IRandomRoll } from "./IRandomRoll";

export interface IRandomRolls {
  description: string | null;
  diceType: number;
  rolls: IRandomRoll[];
  roll(): { description: string | null; result: string|null }[];
}
