import { tableText, tableTextWithParams } from "@/i18n/tableTranslations";
import type { IRandomTable } from "../interfaces/IRandomTable";
import type { IRandomRolls, RollOutcome } from "../interfaces/IRandomRolls";
import { buildTable, type TableConfigMap } from "./tableFactory";
import {
  formatRolledList,
  formatValuedItem,
  rollTotal,
} from "./tableFormatters";

const NPC_LOOT_CONFIG: TableConfigMap = {
  main: {
    description: tableText("tables.npc.section.main.description"),
    die: 20,
    entries: [
      {
        range: "1-6",
        result: tableText("tables.npc.main.result.money"),
        follow: ["money"],
      },
      {
        range: "7-9",
        result: tableText("tables.npc.main.result.personal"),
        follow: ["personal"],
      },
      {
        range: "10-11",
        result: tableText("tables.npc.main.result.special"),
        follow: ["special"],
      },
      {
        range: "12-15",
        result: tableText("tables.npc.main.result.moneyPersonal"),
        follow: ["money", "personal"],
      },
      {
        range: "16-17",
        result: tableText("tables.npc.main.result.moneySpecial"),
        follow: ["money", "special"],
      },
      {
        range: "18-19",
        result: tableText("tables.npc.main.result.personalSpecial"),
        follow: ["personal", "special"],
      },
      {
        range: "20",
        result: tableText("tables.npc.main.result.moneyPersonalSpecial"),
        follow: ["money", "personal", "special"],
      },
    ],
  },
  money: {
    description: tableText("tables.npc.section.money.description"),
    die: 20,
    entries: [
      {
        range: "1-5",
        result: () =>
          formatRolledList([
            { dice: [4, 6], labelKey: "tables.common.unit.kreuzer" },
            { dice: [2, 6], labelKey: "tables.common.unit.heller" },
          ]),
      },
      {
        range: "6-8",
        result: () =>
          formatRolledList([
            { dice: [2, 6], labelKey: "tables.common.unit.kreuzer" },
            { dice: [2, 6], labelKey: "tables.common.unit.heller" },
            { dice: [1, 3], labelKey: "tables.common.unit.silvertalers" },
          ]),
      },
      {
        range: "9-13",
        result: () =>
          formatRolledList([
            { dice: [1, 6], labelKey: "tables.common.unit.kreuzer" },
            { dice: [1, 6], labelKey: "tables.common.unit.heller" },
            { dice: [1, 6], labelKey: "tables.common.unit.silvertalers" },
            { dice: [1, 3], labelKey: "tables.common.unit.ducats" },
          ]),
      },
      {
        range: "14-17",
        result: () =>
          formatRolledList([
            { dice: [1, 6], labelKey: "tables.common.unit.heller" },
            { dice: [2, 6], labelKey: "tables.common.unit.silvertalers" },
            { dice: [1, 6], labelKey: "tables.common.unit.ducats" },
          ]),
      },
      {
        range: "18-20",
        result: () =>
          formatRolledList([
            { dice: [2, 6], labelKey: "tables.common.unit.silvertalers" },
            { dice: [2, 6], labelKey: "tables.common.unit.ducats" },
          ]),
      },
    ],
  },
  personal: {
    description: tableText("tables.npc.section.personal.description"),
    die: 20,
    entries: [
      { range: "1", result: tableText("tables.npc.personal.item.eyeglasses") },
      { range: "2", result: tableText("tables.npc.personal.item.luckyCharm") },
      {
        range: "3",
        result: tableText("tables.npc.personal.item.loverAmulet"),
      },
      { range: "4", result: tableText("tables.npc.personal.item.oldCoin") },
      { range: "5", result: tableText("tables.npc.personal.item.loveLetter") },
      {
        range: "6",
        result: () =>
          formatValuedItem(
            "tables.npc.personal.item.nordlandBankNote",
            [2, 20],
            "tables.common.unit.ducats",
            10,
          ),
      },
      {
        range: "7",
        result: tableText("tables.npc.personal.item.throatLozenges"),
      },
      { range: "8", result: tableText("tables.npc.personal.item.waterskin") },
      { range: "9", result: tableText("tables.npc.personal.item.scarf") },
      { range: "10", result: tableText("tables.npc.personal.item.cap") },
      { range: "11", result: tableText("tables.npc.personal.item.knife") },
      {
        range: "12",
        result: tableText("tables.npc.personal.item.perfumeVial"),
      },
      {
        range: "13",
        result: tableText("tables.npc.personal.item.emptyTinderbox"),
      },
      { range: "14", result: tableText("tables.npc.personal.item.crowbar") },
      { range: "15", result: tableText("tables.npc.personal.item.gloves") },
      {
        range: "16",
        result: tableText("tables.npc.personal.item.powderCompact"),
      },
      { range: "17", result: tableText("tables.npc.personal.item.earrings") },
      { range: "18", result: tableText("tables.npc.personal.item.oilLamp") },
      {
        range: "19",
        result: tableText("tables.npc.personal.item.sisterLetter"),
      },
      { range: "20", result: tableText("tables.npc.personal.item.tobaccoTin") },
    ],
  },
  special: {
    description: tableText("tables.npc.section.special.description"),
    die: 20,
    entries: [
      { range: "1", result: tableText("tables.npc.special.item.secretNote") },
      { range: "2", result: tableText("tables.npc.special.item.lint") },
      {
        range: "3",
        result: tableText("tables.npc.special.item.bindingRope"),
      },
      {
        range: "4",
        result: tableText("tables.npc.special.item.wirselkraut"),
      },
      { range: "5", result: tableText("tables.npc.special.item.spyglass") },
      { range: "6", result: tableText("tables.npc.special.item.compass") },
      { range: "7", result: tableText("tables.npc.special.item.kelmon") },
      { range: "8", result: tableText("tables.npc.special.item.bandages") },
      { range: "9", result: tableText("tables.npc.special.item.magicChalk") },
      {
        range: "10",
        result: () =>
          tableTextWithParams("tables.npc.special.item.borbaradMosquitos", {
            count: rollTotal([1, 6]),
          }),
      },
      { range: "11", result: tableText("tables.npc.special.item.ilmenLeaf") },
      { range: "12", result: tableText("tables.npc.special.item.breviary") },
      {
        range: "13",
        result: tableText("tables.npc.special.item.blessedWater"),
      },
      {
        range: "14",
        result: tableText("tables.npc.special.item.shortMageStaff"),
      },
      {
        range: "15",
        result: tableText("tables.npc.special.item.healingPotionQS4"),
      },
      {
        range: "16",
        result: () =>
          formatRolledList([
            { dice: [1, 6], labelKey: "tables.common.category.jewels" },
          ]),
      },
      { range: "17", result: tableText("tables.npc.special.item.donf") },
      {
        range: "18",
        result: tableText("tables.npc.special.item.magicPotionQS4"),
      },
      {
        range: "19",
        result: tableText("tables.npc.special.item.magicArtifact"),
      },
      {
        range: "20",
        result: tableText("tables.npc.special.item.namelessArtifact"),
      },
    ],
  },
};

export class NpcLootTable implements IRandomTable {
  private readonly npcRolls: IRandomRolls;

  constructor() {
    this.npcRolls = buildTable(NPC_LOOT_CONFIG, "main");
  }

  roll(): RollOutcome[] {
    return this.npcRolls.roll();
  }
}
