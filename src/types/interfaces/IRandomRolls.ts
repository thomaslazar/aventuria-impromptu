import type { LocalizedText } from "@/i18n/localizedText";
import type { IRandomRoll, RollMeta } from "./IRandomRoll";

export interface RollOutcome {
  description: LocalizedText | null;
  result: LocalizedText | null;
  meta?: RollMeta;
}

export interface IRandomRolls {
  description: LocalizedText | null;
  diceType: number;
  rolls: IRandomRoll[];
  roll(): RollOutcome[];
}
