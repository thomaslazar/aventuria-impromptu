import type { IRandomTable } from "../interfaces/IRandomTable";
import type { IRandomRolls } from "../interfaces/IRandomRolls";
import type { RollOutcome } from "../RandomRoll/RandomRolls";
import { buildTable, type TableConfigMap } from "./tableFactory";
import {
  formatKaratItem,
  formatRolledList,
  formatValuedItem,
  rollTotal,
} from "./tableFormatters";

const TREASURE_CONFIG: TableConfigMap = {
  main: {
    description: "Zusammenstellung des Schatzes",
    die: 20,
    entries: [
      { range: "1-3", result: "Münzen", follow: ["coins"] },
      { range: "4-8", result: "Schmuck", follow: ["jewellery"] },
      { range: "9-12", result: "Edelsteine", follow: ["gems"] },
      {
        range: "13-14",
        result: "Münzen und Schmuck",
        follow: ["coins", "jewellery"],
      },
      {
        range: "15-16",
        result: "Münzen und Edelsteine",
        follow: ["coins", "gems"],
      },
      {
        range: "17-18",
        result: "Schmuck und Edelsteine",
        follow: ["jewellery", "gems"],
      },
      {
        range: "19",
        result: "Münzen, Schmuck und Edelsteine",
        follow: ["coins", "jewellery", "gems"],
      },
      { range: "20", result: "Artefakte", follow: ["artefacts"] },
    ],
  },
  coins: {
    description: "Münzen",
    die: 20,
    entries: [
      {
        range: "1",
        result: () => formatRolledList([{ dice: [3, 20], label: "Kreuzer" }]),
      },
      {
        range: "2-3",
        result: () => formatRolledList([{ dice: [3, 20], label: "Heller" }]),
      },
      {
        range: "4-6",
        result: () =>
          formatRolledList([{ dice: [3, 20], label: "Silbertaler" }]),
      },
      {
        range: "7-8",
        result: () => formatRolledList([{ dice: [3, 20], label: "Dukaten" }]),
      },
      {
        range: "9",
        result: () =>
          formatRolledList([
            { dice: [1, 20], label: "Kreuzer" },
            { dice: [1, 20], label: "Heller" },
          ]),
      },
      {
        range: "10-12",
        result: () =>
          formatRolledList([
            { dice: [1, 20], label: "Kreuzer" },
            { dice: [1, 20], label: "Heller" },
            { dice: [1, 20], label: "Silbertaler" },
          ]),
      },
      {
        range: "13-14",
        result: () =>
          formatRolledList([
            { dice: [1, 20], label: "Kreuzer" },
            { dice: [1, 20], label: "Heller" },
            { dice: [1, 20], label: "Silbertaler" },
            { dice: [1, 20], label: "Dukaten" },
          ]),
      },
      {
        range: "15-16",
        result: () =>
          formatRolledList([
            { dice: [2, 20], label: "Silbertaler" },
            { dice: [2, 20], label: "Dukaten" },
          ]),
      },
      {
        range: "17-18",
        result: () =>
          formatRolledList([
            { dice: [1, 20], label: "Kreuzer" },
            { dice: [1, 20], label: "Heller" },
            { dice: [1, 20], label: "Silbertaler" },
            { dice: [1, 20], label: "Dukaten" },
          ]),
      },
      {
        range: "19-20",
        result: () => formatRolledList([{ dice: [5, 20], label: "Dukaten" }]),
      },
    ],
  },
  jewellery: {
    description: "Schmuck",
    die: 20,
    entries: [
      { range: "1-4", result: "Amulett", follow: ["jewelleryMaterial"] },
      { range: "5-6", result: "Armreif", follow: ["jewelleryMaterial"] },
      { range: "7-8", result: "Brosche", follow: ["jewelleryMaterial"] },
      { range: "9", result: "Diadem", follow: ["jewelleryMaterial"] },
      { range: "10-13", result: "Kette", follow: ["jewelleryMaterial"] },
      { range: "14-16", result: "Ohrring", follow: ["jewelleryMaterial"] },
      { range: "17-20", result: "Ring", follow: ["jewelleryMaterial"] },
    ],
  },
  jewelleryMaterial: {
    description: null,
    die: 20,
    entries: [
      { range: "1-2", result: "Eisen" },
      { range: "3-4", result: "Zinn" },
      { range: "5", result: "Messing" },
      { range: "6-7", result: "Bronze" },
      { range: "8-9", result: "Kupfer" },
      { range: "10-13", result: "Silber" },
      { range: "14-17", result: "Gold" },
      { range: "18", result: "Elektrum" },
      { range: "19", result: "Mondsilber" },
      {
        range: "20",
        result: "besonderes Metall",
        follow: ["jewellerySpecialMaterial"],
      },
    ],
  },
  jewellerySpecialMaterial: {
    description: null,
    die: 6,
    entries: [
      { range: "1", result: "Illuminium" },
      { range: "2", result: "Cupritan" },
      { range: "3-4", result: "Meteoreisen" },
      { range: "5", result: "Mindorium" },
      { range: "6", result: "Arkanium" },
    ],
  },
  gems: {
    description: "Edelsteine",
    die: 20,
    entries: [
      { range: "1-2", result: () => formatKaratItem("Speckstein", [2, 6]) },
      { range: "3-4", result: () => formatKaratItem("Obsidian", [2, 6]) },
      { range: "5-6", result: () => formatKaratItem("Perle", [2, 6]) },
      { range: "7-8", result: () => formatKaratItem("Achat", [2, 6]) },
      { range: "9", result: () => formatKaratItem("Türkis", [2, 6]) },
      { range: "10", result: () => formatKaratItem("Aventurin", [2, 6]) },
      { range: "11", result: () => formatKaratItem("Turmalin", [2, 6]) },
      { range: "12", result: () => formatKaratItem("Bergkristall", [2, 6]) },
      { range: "13", result: () => formatKaratItem("Jade", [2, 6]) },
      { range: "14", result: () => formatKaratItem("Topas", [2, 6]) },
      { range: "15", result: () => formatKaratItem("Opal", [2, 6]) },
      { range: "16", result: () => formatKaratItem("Bernstein", [2, 6]) },
      { range: "17", result: () => formatKaratItem("Smaragd", [2, 6]) },
      { range: "18", result: () => formatKaratItem("Saphir", [2, 6]) },
      { range: "19", result: () => formatKaratItem("Rubin", [2, 6]) },
      { range: "20", result: () => formatKaratItem("Diamant", [2, 6]) },
    ],
  },
  artefacts: {
    description: "Artefakte",
    die: 20,
    entries: [
      {
        range: "1-2",
        result: () => `Zaubertrank (QS ${rollTotal([1, 6])})`,
      },
      {
        range: "3-6",
        result: () => `Heiltrank (QS ${rollTotal([1, 6])})`,
      },
      {
        range: "7",
        result: () => `Waffenbalsam (QS ${rollTotal([1, 6])})`,
      },
      { range: "8", result: "Unsichtbarkeitselixier" },
      { range: "9", result: "Verwandlungstrank" },
      { range: "10-11", result: "Antidot" },
      {
        range: "12-13",
        result: () => formatValuedItem("Statuette", [2, 20], "Dukaten"),
      },
      {
        range: "14-15",
        result: () => formatValuedItem("Pokal", [2, 20], "Dukaten"),
      },
      { range: "16-17", result: "Waffe" },
      { range: "18", result: "Rüstung" },
      { range: "19-20", result: "magisches Artefakt" },
    ],
  },
};

export class TreasureLootTable implements IRandomTable {
  private readonly treasureRolls: IRandomRolls;

  constructor() {
    this.treasureRolls = buildTable(TREASURE_CONFIG, "main");
  }

  roll(): RollOutcome[] {
    return this.treasureRolls.roll();
  }
}
