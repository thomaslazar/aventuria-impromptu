import { tableText } from "@/i18n/tableTranslations";
import type { IRandomTable } from "../interfaces/IRandomTable";
import type { IRandomRolls, RollOutcome } from "../interfaces/IRandomRolls";
import { buildTable, type TableConfigMap } from "./tableFactory";

const TAVERN_CONFIG: TableConfigMap = {
  tavern: {
    description: tableText("tables.tavern.description"),
    die: 1,
    entries: [{ range: "1", result: null, follow: ["namePrefix"] }],
  },
  namePrefix: {
    description: tableText("tables.tavern.name.label"),
    die: 20,
    entries: [
      {
        range: "1",
        result: tableText("tables.tavern.namePrefix.gold"),
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur", category: "name-prefix" },
      },
      {
        range: "2",
        result: tableText("tables.tavern.namePrefix.almadine"),
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur", category: "name-prefix" },
      },
      {
        range: "3",
        result: tableText("tables.tavern.namePrefix.dancing"),
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur", category: "name-prefix" },
      },
      {
        range: "4",
        result: tableText("tables.tavern.namePrefix.laughing"),
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur", category: "name-prefix" },
      },
      {
        range: "5",
        result: tableText("tables.tavern.namePrefix.drunken"),
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur", category: "name-prefix" },
      },
      {
        range: "6",
        result: tableText("tables.tavern.namePrefix.merry"),
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur", category: "name-prefix" },
      },
      {
        range: "7",
        result: tableText("tables.tavern.namePrefix.lucky"),
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur", category: "name-prefix" },
      },
      {
        range: "8",
        result: tableText("tables.tavern.namePrefix.leaping"),
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur", category: "name-prefix" },
      },
      {
        range: "9",
        result: tableText("tables.tavern.namePrefix.black"),
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur", category: "name-prefix" },
      },
      {
        range: "10",
        result: tableText("tables.tavern.namePrefix.white"),
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur", category: "name-prefix" },
      },
      {
        range: "11",
        result: tableText("tables.tavern.namePrefix.prancing"),
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur", category: "name-prefix" },
      },
      {
        range: "12",
        result: tableText("tables.tavern.namePrefix.lonely"),
        follow: ["properName"],
        meta: { articleStrategy: "zum-zur", category: "name-prefix" },
      },
      {
        range: "13",
        result: tableText("tables.tavern.namePrefix.emperors"),
        follow: ["properName"],
        meta: { category: "name-prefix" },
      },
      {
        range: "14",
        result: tableText("tables.tavern.namePrefix.two"),
        follow: ["properNamePlural"],
        meta: { category: "name-prefix" },
      },
      {
        range: "15",
        result: tableText("tables.tavern.namePrefix.three"),
        follow: ["properNamePlural"],
        meta: { category: "name-prefix" },
      },
      {
        range: "16",
        result: tableText("tables.tavern.namePrefix.four"),
        follow: ["properNamePlural"],
        meta: { category: "name-prefix" },
      },
      { range: "17-18", result: null, follow: ["properNameSpecial1"] },
      { range: "19-20", result: null, follow: ["properNameSpecial2"] },
    ],
  },
  properName: {
    description: null,
    die: 20,
    entries: [
      {
        range: "1",
        result: tableText("tables.tavern.proper.unicorn"),
        meta: { gender: "neuter", category: "name-noun" },
      },
      {
        range: "2",
        result: tableText("tables.tavern.proper.bull"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "3",
        result: tableText("tables.tavern.proper.stag"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "4",
        result: tableText("tables.tavern.proper.king"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "5",
        result: tableText("tables.tavern.proper.princess"),
        meta: { gender: "feminine", category: "name-noun" },
      },
      {
        range: "6",
        result: tableText("tables.tavern.proper.boar"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "7",
        result: tableText("tables.tavern.proper.eagle"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "8",
        result: tableText("tables.tavern.proper.crown"),
        meta: { gender: "feminine", category: "name-noun" },
      },
      {
        range: "9",
        result: tableText("tables.tavern.proper.executioner"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "10",
        result: tableText("tables.tavern.proper.traveler"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "11",
        result: tableText("tables.tavern.proper.jellyfish"),
        meta: { gender: "feminine", category: "name-noun" },
      },
      {
        range: "12",
        result: tableText("tables.tavern.proper.dolphin"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "13",
        result: tableText("tables.tavern.proper.carp"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "14",
        result: tableText("tables.tavern.proper.pony"),
        meta: { gender: "neuter", category: "name-noun" },
      },
      {
        range: "15",
        result: tableText("tables.tavern.proper.boot"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "16",
        result: tableText("tables.tavern.proper.vagabond"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "17",
        result: tableText("tables.tavern.proper.mare"),
        meta: { gender: "feminine", category: "name-noun" },
      },
      {
        range: "18",
        result: tableText("tables.tavern.proper.bucket"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "19",
        result: tableText("tables.tavern.proper.pilgrim"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "20",
        result: tableText("tables.tavern.proper.drum"),
        meta: { gender: "feminine", category: "name-noun" },
      },
    ],
  },
  properNamePlural: {
    description: null,
    die: 20,
    entries: [
      {
        range: "1",
        result: tableText("tables.tavern.properPlural.unicorns"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "2",
        result: tableText("tables.tavern.properPlural.bulls"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "3",
        result: tableText("tables.tavern.properPlural.stags"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "4",
        result: tableText("tables.tavern.properPlural.kings"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "5",
        result: tableText("tables.tavern.properPlural.princesses"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "6",
        result: tableText("tables.tavern.properPlural.boars"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "7",
        result: tableText("tables.tavern.properPlural.eagles"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "8",
        result: tableText("tables.tavern.properPlural.crowns"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "9",
        result: tableText("tables.tavern.properPlural.executioners"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "10",
        result: tableText("tables.tavern.properPlural.travelers"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "11",
        result: tableText("tables.tavern.properPlural.jellyfish"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "12",
        result: tableText("tables.tavern.properPlural.dolphins"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "13",
        result: tableText("tables.tavern.properPlural.carp"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "14",
        result: tableText("tables.tavern.properPlural.ponies"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "15",
        result: tableText("tables.tavern.properPlural.boots"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "16",
        result: tableText("tables.tavern.properPlural.vagabonds"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "17",
        result: tableText("tables.tavern.properPlural.mares"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "18",
        result: tableText("tables.tavern.properPlural.buckets"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "19",
        result: tableText("tables.tavern.properPlural.pilgrims"),
        meta: { gender: "plural", category: "name-noun" },
      },
      {
        range: "20",
        result: tableText("tables.tavern.properPlural.drums"),
        meta: { gender: "plural", category: "name-noun" },
      },
    ],
  },
  properNameSpecial1: {
    description: null,
    die: 6,
    entries: [
      {
        range: "1",
        result: tableText("tables.tavern.nameSpecial.homesteadMountain"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "2",
        result: tableText("tables.tavern.nameSpecial.homesteadForest"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "3",
        result: tableText("tables.tavern.nameSpecial.homesteadLinden"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "4",
        result: tableText("tables.tavern.nameSpecial.homesteadOak"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "5",
        result: tableText("tables.tavern.nameSpecial.homesteadImperial"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "6",
        result: tableText("tables.tavern.nameSpecial.homesteadRealm"),
        meta: { gender: "masculine", category: "name-noun" },
      },
    ],
  },
  properNameSpecial2: {
    description: null,
    die: 6,
    entries: [
      {
        range: "1",
        result: tableText("tables.tavern.nameSpecial.valpostube"),
        meta: { gender: "feminine", category: "name-noun" },
      },
      {
        range: "2",
        result: tableText("tables.tavern.nameSpecial.beiAlrik"),
        meta: { gender: "masculine", category: "name-noun" },
      },
      {
        range: "3",
        result: tableText("tables.tavern.nameSpecial.aroundCorner"),
        meta: { gender: "neuter", category: "name-noun" },
      },
      {
        range: "4",
        result: tableText("tables.tavern.nameSpecial.beerHall"),
        meta: { gender: "feminine", category: "name-noun" },
      },
      {
        range: "5",
        result: tableText("tables.tavern.nameSpecial.traviaRest"),
        meta: { gender: "feminine", category: "name-noun" },
      },
      {
        range: "6",
        result: tableText("tables.tavern.nameSpecial.anchor"),
        meta: { gender: "masculine", category: "name-noun" },
      },
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
