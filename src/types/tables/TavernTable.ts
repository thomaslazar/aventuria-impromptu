import type { IRandomTable } from "../interfaces/IRandomTable";
import type { IRandomRolls } from "../interfaces/IRandomRolls";
import { buildTable, type TableConfigMap } from "./tableFactory";

const TAVERN_CONFIG: TableConfigMap = {
  tavern: {
    description: "Gaststube/Taverne",
    die: 1,
    entries: [{ range: "1", result: null, follow: ["namePrefix"] }],
  },
  namePrefix: {
    description: "Name",
    die: 20,
    entries: [
      { range: "1", result: "Zum/ Zur goldenen", follow: ["properName"] },
      { range: "2", result: "Zum/ Zur almadinenen", follow: ["properName"] },
      { range: "3", result: "Zum/ Zur tanzenden", follow: ["properName"] },
      { range: "4", result: "Zum/ Zur lachenden", follow: ["properName"] },
      { range: "5", result: "Zum/ Zur betrunkenen", follow: ["properName"] },
      { range: "6", result: "Zum/ Zur fröhlichen", follow: ["properName"] },
      { range: "7", result: "Zum/ Zur glücklichen", follow: ["properName"] },
      { range: "8", result: "Zum/ Zur springenden", follow: ["properName"] },
      { range: "9", result: "Zum/ Zur schwarzen", follow: ["properName"] },
      { range: "10", result: "Zum/ Zur weißen", follow: ["properName"] },
      { range: "11", result: "Zum/ Zur tänzelnden", follow: ["properName"] },
      { range: "12", result: "Zum/ Zur einsamen", follow: ["properName"] },
      { range: "13", result: "Des Kaisers", follow: ["properName"] },
      {
        range: "14",
        result: "Die zwei <Nachfolgendes im Plural>",
        follow: ["properName"],
      },
      {
        range: "15",
        result: "Die drei <Nachfolgendes im Plural>",
        follow: ["properName"],
      },
      {
        range: "16",
        result: "Die vier <Nachfolgendes im Plural>",
        follow: ["properName"],
      },
      { range: "17-18", result: null, follow: ["properNameSpecial1"] },
      { range: "19-20", result: null, follow: ["properNameSpecial2"] },
    ],
  },
  properName: {
    description: null,
    die: 20,
    entries: [
      { range: "1", result: "Einhorn" },
      { range: "2", result: "Stier" },
      { range: "3", result: "Hirsch" },
      { range: "4", result: "König" },
      { range: "5", result: "Prinzessin" },
      { range: "6", result: "Keiler" },
      { range: "7", result: "Adler" },
      { range: "8", result: "Krone" },
      { range: "9", result: "Henker" },
      { range: "10", result: "Reisenden" },
      { range: "11", result: "Qualle" },
      { range: "12", result: "Delphin" },
      { range: "13", result: "Karpfen" },
      { range: "14", result: "Pony" },
      { range: "15", result: "Stiefel" },
      { range: "16", result: "Vagabunden" },
      { range: "17", result: "Stute" },
      { range: "18", result: "Eimer" },
      { range: "19", result: "Pilger" },
      { range: "20", result: "Trommel" },
    ],
  },
  properNameSpecial1: {
    description: null,
    die: 6,
    entries: [
      { range: "1", result: "Berghof" },
      { range: "2", result: "Waldhof" },
      { range: "3", result: "Lindenhof" },
      { range: "4", result: "Eichenhof" },
      { range: "5", result: "Kaiserhof" },
      { range: "6", result: "Reichshof" },
    ],
  },
  properNameSpecial2: {
    description: null,
    die: 6,
    entries: [
      { range: "1", result: "Valpostube" },
      { range: "2", result: "Bei Alrik" },
      { range: "3", result: "Ums Eck" },
      { range: "4", result: "Bierschwemme" },
      { range: "5", result: "Travias Einkehr" },
      { range: "6", result: "Zum Anker" },
    ],
  },
};

export class TavernTable implements IRandomTable {
  private readonly tavernRolls: IRandomRolls;

  constructor() {
    this.tavernRolls = buildTable(TAVERN_CONFIG, "tavern");
  }

  roll(): { description: string | null; result: string | null }[] {
    return this.tavernRolls.roll();
  }
}
