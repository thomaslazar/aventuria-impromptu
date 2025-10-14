import type { LocalizedText, LocalizedTextFactory } from "@/i18n/localizedText";
import type { IRandomRolls } from "./IRandomRolls";

export type RollResult = LocalizedText | null | LocalizedTextFactory;

export interface RollMeta {
  gender?: "masculine" | "feminine" | "neuter" | "plural";
  articleStrategy?: "zum-zur";
  tableKey?: string;
  entryId?: string;
  category?: string;
}

export interface IRandomRoll {
  rollChance: number[];
  result: RollResult;
  meta?: RollMeta;
  followupRolls: IRandomRolls[] | null;
}
