import { describe, expect, it, vi, afterEach } from "vitest";

import { RandomRolls } from "@/types/RandomRoll/RandomRolls";
import { Dice } from "@/types/Dice";
import { NpcLootTable } from "@/types/tables/NpcLootTable";
import { TavernTable } from "@/types/tables/TavernTable";
import { TreasureLootTable } from "@/types/tables/TreasureLootTable";
import { __testUtils as tableFactoryTestUtils } from "@/types/tables/tableFactory";
import { getFallbackText } from "@/i18n/localizedText";
import type { RollOutcome } from "@/types/interfaces/IRandomRolls";

afterEach(() => {
  vi.restoreAllMocks();
});

function mockDiceSequence(sequence: number[]) {
  const values = [...sequence];
  return vi.spyOn(Dice, "roll").mockImplementation(() => {
    if (values.length === 0) {
      throw new Error("Dice roll test sequence exhausted");
    }

    return values.shift()!;
  });
}

describe("tableFactory helpers", () => {
  it("expands ranged expressions", () => {
    expect(tableFactoryTestUtils.expandRange("1-3,5,7-8")).toEqual([
      1, 2, 3, 5, 7, 8,
    ]);
  });
});

describe("RandomRolls", () => {
  it("evaluates functional results lazily", () => {
    let counter = 0;

    const rolls = new RandomRolls("test-table", "Test", 1, [
      {
        rollChance: [1],
        result: () => `Value-${++counter}`,
        followupRolls: null,
      },
    ]);

    const first = rolls.roll()[0];
    const second = rolls.roll()[0];

    expect(first).toBeDefined();
    expect(first!.result).toBe("Value-1");
    expect(second).toBeDefined();
    expect(second!.result).toBe("Value-2");
  });
});

const toPlain = (outcome: RollOutcome) => ({
  description: getFallbackText(outcome.description),
  result: getFallbackText(outcome.result),
});

describe("NpcLootTable", () => {
  it("chains follow-up tables and evaluates dynamic strings", () => {
    const diceSpy = mockDiceSequence([20, 18, 7, 8, 6, 15, 10, 4]);

    const table = new NpcLootTable();
    const results = table.roll();

    expect(diceSpy).toHaveBeenCalled();
    expect(results).toHaveLength(4);

    const main = results[0]!;
    const money = results[1]!;
    const personal = results[2]!;
    const special = results[3]!;

    expect(toPlain(main)).toEqual({
      description: "Zusammenstellung des Schatzes",
      result: "Geld, persönlicher und besonderer Gegenstand",
    });
    expect(toPlain(money)).toEqual({
      description: "Geld",
      result: "7 Silbertaler, 8 Dukaten",
    });
    expect(toPlain(personal)).toEqual({
      description: "Persönliche Gegenstände",
      result: "Schuldschein der Nordlandbank (25 Dukaten)",
    });
    expect(toPlain(special)).toEqual({
      description: "Besondere Gegenstände",
      result: "Kästchen mit 4 Borbarad-Moskitos",
    });
  });
});

describe("TavernTable", () => {
  it("produces a composite tavern name", () => {
    mockDiceSequence([1, 1, 1]);

    const table = new TavernTable();
    const results = table.roll();

    const nameEntry = results[1]!;
    const detailEntry = results[2]!;

    expect(toPlain(nameEntry)).toEqual({
      description: "Name",
      result: "Zum/ Zur goldenen",
    });
    expect(nameEntry.meta?.articleStrategy).toBe("zum-zur");
    expect(toPlain(detailEntry)).toEqual({
      description: null,
      result: "Einhorn",
    });
    expect(detailEntry.meta?.gender).toBe("neuter");
  });
});

describe("TreasureLootTable", () => {
  it("returns combined treasure categories with nested materials", () => {
    mockDiceSequence([19, 15, 30, 35, 4, 20, 5, 20, 9]);

    const table = new TreasureLootTable();
    const results = table.roll();

    const main = results[0]!;
    const coins = results[1]!;
    const jewellery = results[2]!;
    const gems = results[3]!;

    expect(toPlain(main)).toEqual({
      description: "Zusammenstellung des Schatzes",
      result: "Münzen, Schmuck und Edelsteine",
    });
    expect(toPlain(coins)).toEqual({
      description: "Münzen",
      result: "30 Silbertaler, 35 Dukaten",
    });
    expect(toPlain(jewellery)).toEqual({
      description: "Schmuck",
      result: "Amulett (besonderes Metall, Mindorium)",
    });
    expect(toPlain(gems)).toEqual({
      description: "Edelsteine",
      result: "Diamant (9 Karat)",
    });
  });
});
