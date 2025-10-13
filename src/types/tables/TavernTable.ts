import type { IRandomTable } from "../interfaces/IRandomTable";
import type { IRandomRolls } from "../interfaces/IRandomRolls";
import type { RollOutcome } from "../RandomRoll/RandomRolls";
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
      {
        range: "1",
        result: "Zum/ Zur goldenen",
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur" },
      },
      {
        range: "2",
        result: "Zum/ Zur almadinenen",
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur" },
      },
      {
        range: "3",
        result: "Zum/ Zur tanzenden",
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur" },
      },
      {
        range: "4",
        result: "Zum/ Zur lachenden",
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur" },
      },
      {
        range: "5",
        result: "Zum/ Zur betrunkenen",
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur" },
      },
      {
        range: "6",
        result: "Zum/ Zur fröhlichen",
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur" },
      },
      {
        range: "7",
        result: "Zum/ Zur glücklichen",
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur" },
      },
      {
        range: "8",
        result: "Zum/ Zur springenden",
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur" },
      },
      {
        range: "9",
        result: "Zum/ Zur schwarzen",
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur" },
      },
      {
        range: "10",
        result: "Zum/ Zur weißen",
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur" },
      },
      {
        range: "11",
        result: "Zum/ Zur tänzelnden",
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur" },
      },
      {
        range: "12",
        result: "Zum/ Zur einsamen",
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur" },
      },
      { range: "13", result: "Des Kaisers", follow: ["properName"] },
      { range: "14", result: "Die zwei", follow: ["properNamePlural"] },
      { range: "15", result: "Die drei", follow: ["properNamePlural"] },
      { range: "16", result: "Die vier", follow: ["properNamePlural"] },
      { range: "17-18", result: null, follow: ["properNameSpecial1"] },
      { range: "19-20", result: null, follow: ["properNameSpecial2"] },
    ],
  },
  properName: {
    description: null,
    die: 20,
    entries: [
      { range: "1", result: "Einhorn", meta: { gender: "neuter" } },
      { range: "2", result: "Stier", meta: { gender: "masculine" } },
      { range: "3", result: "Hirsch", meta: { gender: "masculine" } },
      { range: "4", result: "König", meta: { gender: "masculine" } },
      { range: "5", result: "Prinzessin", meta: { gender: "feminine" } },
      { range: "6", result: "Keiler", meta: { gender: "masculine" } },
      { range: "7", result: "Adler", meta: { gender: "masculine" } },
      { range: "8", result: "Krone", meta: { gender: "feminine" } },
      { range: "9", result: "Henker", meta: { gender: "masculine" } },
      { range: "10", result: "Reisenden", meta: { gender: "masculine" } },
      { range: "11", result: "Qualle", meta: { gender: "feminine" } },
      { range: "12", result: "Delphin", meta: { gender: "masculine" } },
      { range: "13", result: "Karpfen", meta: { gender: "masculine" } },
      { range: "14", result: "Pony", meta: { gender: "neuter" } },
      { range: "15", result: "Stiefel", meta: { gender: "masculine" } },
      { range: "16", result: "Vagabund", meta: { gender: "masculine" } },
      { range: "17", result: "Stute", meta: { gender: "feminine" } },
      { range: "18", result: "Eimer", meta: { gender: "masculine" } },
      { range: "19", result: "Pilger", meta: { gender: "masculine" } },
      { range: "20", result: "Trommel", meta: { gender: "feminine" } },
    ],
  },
  properNamePlural: {
    description: null,
    die: 20,
    entries: [
      { range: "1", result: "Einhörner", meta: { gender: "plural" } },
      { range: "2", result: "Stiere", meta: { gender: "plural" } },
      { range: "3", result: "Hirsche", meta: { gender: "plural" } },
      { range: "4", result: "Könige", meta: { gender: "plural" } },
      { range: "5", result: "Prinzessinnen", meta: { gender: "plural" } },
      { range: "6", result: "Keiler", meta: { gender: "plural" } },
      { range: "7", result: "Adler", meta: { gender: "plural" } },
      { range: "8", result: "Kronen", meta: { gender: "plural" } },
      { range: "9", result: "Henker", meta: { gender: "plural" } },
      { range: "10", result: "Reisenden", meta: { gender: "plural" } },
      { range: "11", result: "Quallen", meta: { gender: "plural" } },
      { range: "12", result: "Delphine", meta: { gender: "plural" } },
      { range: "13", result: "Karpfen", meta: { gender: "plural" } },
      { range: "14", result: "Ponys", meta: { gender: "plural" } },
      { range: "15", result: "Stiefel", meta: { gender: "plural" } },
      { range: "16", result: "Vagabunden", meta: { gender: "plural" } },
      { range: "17", result: "Stuten", meta: { gender: "plural" } },
      { range: "18", result: "Eimer", meta: { gender: "plural" } },
      { range: "19", result: "Pilger", meta: { gender: "plural" } },
      { range: "20", result: "Trommeln", meta: { gender: "plural" } },
    ],
  },
  properNameSpecial1: {
    description: null,
    die: 6,
    entries: [
      { range: "1", result: "Berghof", meta: { gender: "masculine" } },
      { range: "2", result: "Waldhof", meta: { gender: "masculine" } },
      { range: "3", result: "Lindenhof", meta: { gender: "masculine" } },
      { range: "4", result: "Eichenhof", meta: { gender: "masculine" } },
      { range: "5", result: "Kaiserhof", meta: { gender: "masculine" } },
      { range: "6", result: "Reichshof", meta: { gender: "masculine" } },
    ],
  },
  properNameSpecial2: {
    description: null,
    die: 6,
    entries: [
      { range: "1", result: "Valpostube", meta: { gender: "feminine" } },
      { range: "2", result: "Bei Alrik", meta: { gender: "masculine" } },
      { range: "3", result: "Ums Eck", meta: { gender: "neuter" } },
      { range: "4", result: "Bierschwemme", meta: { gender: "feminine" } },
      { range: "5", result: "Travias Einkehr", meta: { gender: "feminine" } },
      { range: "6", result: "Zum Anker", meta: { gender: "masculine" } },
    ],
  },
};

export class TavernTable implements IRandomTable {
  private readonly tavernRolls: IRandomRolls;

  constructor() {
    this.tavernRolls = buildTable(TAVERN_CONFIG, "tavern");
  }

  roll(): RollOutcome[] {
    return this.tavernRolls.roll();
  }
}
