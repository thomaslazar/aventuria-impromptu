import type { IRandomTable } from "../interfaces/IRandomTable";
import type { IRandomRolls } from "../interfaces/IRandomRolls";
import type { RollOutcome } from "../RandomRoll/RandomRolls";
import { buildTable, type TableConfigMap } from "./tableFactory";
import {
  formatRolledList,
  formatValuedItem,
  rollTotal,
} from "./tableFormatters";

const NPC_LOOT_CONFIG: TableConfigMap = {
  main: {
    description: "Zusammenstellung des Schatzes",
    die: 20,
    entries: [
      { range: "1-6", result: "Geld", follow: ["money"] },
      { range: "7-9", result: "Persönlicher Gegenstand", follow: ["personal"] },
      { range: "10-11", result: "Besondere Gegenstände", follow: ["special"] },
      {
        range: "12-15",
        result: "Geld und persönlicher Gegenstand",
        follow: ["money", "personal"],
      },
      {
        range: "16-17",
        result: "Geld und besonderer Gegenstand",
        follow: ["money", "special"],
      },
      {
        range: "18-19",
        result: "Persönlicher und besonderer Gegenstand",
        follow: ["personal", "special"],
      },
      {
        range: "20",
        result: "Geld, persönlicher und besonderer Gegenstand",
        follow: ["money", "personal", "special"],
      },
    ],
  },
  money: {
    description: "Geld",
    die: 20,
    entries: [
      {
        range: "1-5",
        result: () =>
          formatRolledList([
            { dice: [4, 6], label: "Kreuzer" },
            { dice: [2, 6], label: "Heller" },
          ]),
      },
      {
        range: "6-8",
        result: () =>
          formatRolledList([
            { dice: [2, 6], label: "Kreuzer" },
            { dice: [2, 6], label: "Heller" },
            { dice: [1, 3], label: "Silbertaler" },
          ]),
      },
      {
        range: "9-13",
        result: () =>
          formatRolledList([
            { dice: [1, 6], label: "Kreuzer" },
            { dice: [1, 6], label: "Heller" },
            { dice: [1, 6], label: "Silbertaler" },
            { dice: [1, 3], label: "Dukaten" },
          ]),
      },
      {
        range: "14-17",
        result: () =>
          formatRolledList([
            { dice: [1, 6], label: "Heller" },
            { dice: [2, 6], label: "Silbertaler" },
            { dice: [1, 6], label: "Dukaten" },
          ]),
      },
      {
        range: "18-20",
        result: () =>
          formatRolledList([
            { dice: [2, 6], label: "Silbertaler" },
            { dice: [2, 6], label: "Dukaten" },
          ]),
      },
    ],
  },
  personal: {
    description: "Persönliche Gegenstände",
    die: 20,
    entries: [
      { range: "1", result: "Augengläser" },
      { range: "2", result: "Glücksbringer" },
      { range: "3", result: "Amulett mit dem Portrait des Geliebten" },
      { range: "4", result: "alte Münze" },
      { range: "5", result: "Liebesbrief" },
      {
        range: "6",
        result: () =>
          formatValuedItem(
            "Schuldschein der Nordlandbank",
            [2, 20],
            "Dukaten",
            10,
          ),
      },
      { range: "7", result: "Pastillen gegen Halsschmerzen" },
      { range: "8", result: "Wasserschlauch" },
      { range: "9", result: "Halstuch" },
      { range: "10", result: "Mütze" },
      { range: "11", result: "Messer" },
      { range: "12", result: "Parfümfläschchen" },
      { range: "13", result: "leere Zunderdose" },
      { range: "14", result: "Brecheisen" },
      { range: "15", result: "Handschuhe" },
      { range: "16", result: "Puderdose" },
      { range: "17", result: "Ohrringe" },
      { range: "18", result: "Öllampe" },
      { range: "19", result: "Brief der Schwester" },
      { range: "20", result: "Tabakdose" },
    ],
  },
  special: {
    description: "Besondere Gegenstände",
    die: 20,
    entries: [
      { range: "1", result: "Notizzettel mit Geheimnissen" },
      { range: "2", result: "Fusseln" },
      { range: "3", result: "Fesselseil" },
      { range: "4", result: "1 Anwendung Wirselkraut" },
      { range: "5", result: "Fernrohr, einziehbar" },
      { range: "6", result: "Kompass" },
      { range: "7", result: "1 Portion Kelmon" },
      { range: "8", result: "Verbandszeug" },
      { range: "9", result: "Zauberkreide" },
      {
        range: "10",
        result: () => `Kästchen mit ${rollTotal([1, 6])} Borbarad-Moskitos`,
      },
      { range: "11", result: "1 Portion Ilmenblatt" },
      { range: "12", result: "Brevier der zwölfgöttlichen Unterweisung" },
      { range: "13", result: "Flasche mit efferdgeweihtem Wasser" },
      { range: "14", result: "kurzer Magierstab" },
      { range: "15", result: "Heiltrank (QS 4)" },
      {
        range: "16",
        result: () => formatRolledList([{ dice: [1, 6], label: "Juwelen" }]),
      },
      { range: "17", result: "1 Anwendung Donf" },
      { range: "18", result: "Zaubertrank (QS 4)" },
      { range: "19", result: "magisches Artefakt" },
      { range: "20", result: "Namenloses oder dämonisches Artefakt" },
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
