import {
  createInlineLocalizedText,
  resolveInlineText,
  type InlineLocalizedText,
} from "@/i18n/localizedText";
import { tableText, type TableTranslationKey } from "@/i18n/tableTranslations";
import { Dice } from "../Dice";

export type DiceTuple = [number, number];

export interface RolledSegment {
  dice: DiceTuple;
  labelKey: TableTranslationKey;
  modifier?: number;
}

export function rollTotal([diceCount, diceType]: DiceTuple): number {
  return Dice.roll(diceCount, diceType);
}

export function formatRolledList(
  segments: RolledSegment[],
): InlineLocalizedText {
  const partsDe: string[] = [];
  const partsEn: string[] = [];

  for (const { dice, labelKey, modifier } of segments) {
    const amount = rollTotal(dice) + (modifier ?? 0);
    const label = tableText(labelKey);
    partsDe.push(`${amount} ${resolveInlineText(label, "de")}`);
    partsEn.push(`${amount} ${resolveInlineText(label, "en")}`);
  }

  return createInlineLocalizedText(partsDe.join(", "), partsEn.join(", "));
}

export function formatKaratItem(
  nameKey: TableTranslationKey,
  dice: DiceTuple,
): InlineLocalizedText {
  const karatAmount = rollTotal(dice);
  const name = tableText(nameKey);
  const unit = tableText("tables.common.unit.carat");
  const de = `${resolveInlineText(name, "de")} (${karatAmount} ${resolveInlineText(unit, "de")})`;
  const en = `${resolveInlineText(name, "en")} (${karatAmount} ${resolveInlineText(unit, "en")})`;
  return createInlineLocalizedText(de, en);
}

export function formatValuedItem(
  nameKey: TableTranslationKey,
  valueDice: DiceTuple,
  unitKey: TableTranslationKey,
  modifier = 0,
): InlineLocalizedText {
  const value = rollTotal(valueDice) + modifier;
  const name = tableText(nameKey);
  const unit = tableText(unitKey);
  return createInlineLocalizedText(
    `${resolveInlineText(name, "de")} (${value} ${resolveInlineText(unit, "de")})`,
    `${resolveInlineText(name, "en")} (${value} ${resolveInlineText(unit, "en")})`,
  );
}
