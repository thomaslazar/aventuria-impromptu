import type { RollOutcome } from "./IRandomRolls";

export interface IRandomTable {
  roll(): RollOutcome[];
}
