import { Dice } from "../Dice";

export type DiceTuple = [number, number];

export interface RolledSegment {
  dice: DiceTuple;
  label: string;
  modifier?: number;
}

export function rollTotal([diceCount, diceType]: DiceTuple): number {
  return Dice.roll(diceCount, diceType);
}

export function formatRolledList(segments: RolledSegment[]): string {
  return segments
    .map(({ dice, label, modifier }) => {
      const amount = rollTotal(dice) + (modifier ?? 0);
      return `${amount} ${label}`;
    })
    .join(", ");
}

export function formatKaratItem(name: string, dice: DiceTuple): string {
  return `${name} (${rollTotal(dice)} Karat)`;
}

export function formatValuedItem(
  name: string,
  valueDice: DiceTuple,
  unit: string,
  modifier = 0,
): string {
  return `${name} (${rollTotal(valueDice) + modifier} ${unit})`;
}
