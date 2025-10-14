import { tableText, tableTextWithParams } from "@/i18n/tableTranslations";
import {
  createInlineLocalizedText,
  getFallbackText,
  isInlineLocalizedText,
  resolveInlineText,
  type InlineLocalizedText,
  type LocalizedText,
} from "@/i18n/localizedText";
import type { IRandomTable } from "../interfaces/IRandomTable";
import type { IRandomRolls, RollOutcome } from "../interfaces/IRandomRolls";
import { buildTable, type TableConfigMap } from "./tableFactory";
import {
  formatKaratItem,
  formatRolledList,
  formatValuedItem,
  rollTotal,
} from "./tableFormatters";

const TREASURE_CONFIG: TableConfigMap = {
  main: {
    description: tableText("tables.treasure.section.main.description"),
    die: 20,
    entries: [
      {
        range: "1-3",
        result: tableText("tables.treasure.main.result.coins"),
        follow: ["coins"],
      },
      {
        range: "4-8",
        result: tableText("tables.treasure.main.result.jewellery"),
        follow: ["jewellery"],
      },
      {
        range: "9-12",
        result: tableText("tables.treasure.main.result.gems"),
        follow: ["gems"],
      },
      {
        range: "13-14",
        result: tableText("tables.treasure.main.result.coinsJewellery"),
        follow: ["coins", "jewellery"],
      },
      {
        range: "15-16",
        result: tableText("tables.treasure.main.result.coinsGems"),
        follow: ["coins", "gems"],
      },
      {
        range: "17-18",
        result: tableText("tables.treasure.main.result.jewelleryGems"),
        follow: ["jewellery", "gems"],
      },
      {
        range: "19",
        result: tableText("tables.treasure.main.result.coinsJewelleryGems"),
        follow: ["coins", "jewellery", "gems"],
      },
      {
        range: "20",
        result: tableText("tables.treasure.main.result.artefacts"),
        follow: ["artefacts"],
      },
    ],
  },
  coins: {
    description: tableText("tables.treasure.section.coins.description"),
    die: 20,
    entries: [
      {
        range: "1",
        result: () =>
          formatRolledList([
            { dice: [3, 20], labelKey: "tables.common.unit.kreuzer" },
          ]),
      },
      {
        range: "2-3",
        result: () =>
          formatRolledList([
            { dice: [3, 20], labelKey: "tables.common.unit.heller" },
          ]),
      },
      {
        range: "4-6",
        result: () =>
          formatRolledList([
            { dice: [3, 20], labelKey: "tables.common.unit.silvertalers" },
          ]),
      },
      {
        range: "7-8",
        result: () =>
          formatRolledList([
            { dice: [3, 20], labelKey: "tables.common.unit.ducats" },
          ]),
      },
      {
        range: "9",
        result: () =>
          formatRolledList([
            { dice: [1, 20], labelKey: "tables.common.unit.kreuzer" },
            { dice: [1, 20], labelKey: "tables.common.unit.heller" },
          ]),
      },
      {
        range: "10-12",
        result: () =>
          formatRolledList([
            { dice: [1, 20], labelKey: "tables.common.unit.kreuzer" },
            { dice: [1, 20], labelKey: "tables.common.unit.heller" },
            { dice: [1, 20], labelKey: "tables.common.unit.silvertalers" },
          ]),
      },
      {
        range: "13-14",
        result: () =>
          formatRolledList([
            { dice: [1, 20], labelKey: "tables.common.unit.kreuzer" },
            { dice: [1, 20], labelKey: "tables.common.unit.heller" },
            { dice: [1, 20], labelKey: "tables.common.unit.silvertalers" },
            { dice: [1, 20], labelKey: "tables.common.unit.ducats" },
          ]),
      },
      {
        range: "15-16",
        result: () =>
          formatRolledList([
            { dice: [2, 20], labelKey: "tables.common.unit.silvertalers" },
            { dice: [2, 20], labelKey: "tables.common.unit.ducats" },
          ]),
      },
      {
        range: "17-18",
        result: () =>
          formatRolledList([
            { dice: [1, 20], labelKey: "tables.common.unit.kreuzer" },
            { dice: [1, 20], labelKey: "tables.common.unit.heller" },
            { dice: [1, 20], labelKey: "tables.common.unit.silvertalers" },
            { dice: [1, 20], labelKey: "tables.common.unit.ducats" },
          ]),
      },
      {
        range: "19-20",
        result: () =>
          formatRolledList([
            { dice: [5, 20], labelKey: "tables.common.unit.ducats" },
          ]),
      },
    ],
  },
  jewellery: {
    description: tableText("tables.treasure.section.jewellery.description"),
    die: 20,
    entries: [
      {
        range: "1-4",
        result: tableText("tables.treasure.jewellery.item.amulet"),
        follow: ["jewelleryMaterial"],
      },
      {
        range: "5-6",
        result: tableText("tables.treasure.jewellery.item.bracelet"),
        follow: ["jewelleryMaterial"],
      },
      {
        range: "7-8",
        result: tableText("tables.treasure.jewellery.item.brooch"),
        follow: ["jewelleryMaterial"],
      },
      {
        range: "9",
        result: tableText("tables.treasure.jewellery.item.diadem"),
        follow: ["jewelleryMaterial"],
      },
      {
        range: "10-13",
        result: tableText("tables.treasure.jewellery.item.necklace"),
        follow: ["jewelleryMaterial"],
      },
      {
        range: "14-16",
        result: tableText("tables.treasure.jewellery.item.earring"),
        follow: ["jewelleryMaterial"],
      },
      {
        range: "17-20",
        result: tableText("tables.treasure.jewellery.item.ring"),
        follow: ["jewelleryMaterial"],
      },
    ],
  },
  jewelleryMaterial: {
    description: null,
    die: 20,
    entries: [
      { range: "1-2", result: tableText("tables.treasure.material.iron") },
      { range: "3-4", result: tableText("tables.treasure.material.tin") },
      { range: "5", result: tableText("tables.treasure.material.brass") },
      { range: "6-7", result: tableText("tables.treasure.material.bronze") },
      { range: "8-9", result: tableText("tables.treasure.material.copper") },
      { range: "10-13", result: tableText("tables.treasure.material.silver") },
      { range: "14-17", result: tableText("tables.treasure.material.gold") },
      { range: "18", result: tableText("tables.treasure.material.electrum") },
      {
        range: "19",
        result: tableText("tables.treasure.material.moonsilver"),
      },
      {
        range: "20",
        result: tableText("tables.treasure.material.special"),
        follow: ["jewellerySpecialMaterial"],
      },
    ],
  },
  jewellerySpecialMaterial: {
    description: null,
    die: 6,
    entries: [
      {
        range: "1",
        result: tableText("tables.treasure.material.illuminium"),
      },
      {
        range: "2",
        result: tableText("tables.treasure.material.cupritan"),
      },
      {
        range: "3-4",
        result: tableText("tables.treasure.material.meteoricIron"),
      },
      {
        range: "5",
        result: tableText("tables.treasure.material.mindorium"),
      },
      {
        range: "6",
        result: tableText("tables.treasure.material.arcanium"),
      },
    ],
  },
  gems: {
    description: tableText("tables.treasure.section.gems.description"),
    die: 20,
    entries: [
      {
        range: "1-2",
        result: () => formatKaratItem("tables.treasure.gem.soapstone", [2, 6]),
      },
      {
        range: "3-4",
        result: () => formatKaratItem("tables.treasure.gem.obsidian", [2, 6]),
      },
      {
        range: "5-6",
        result: () => formatKaratItem("tables.treasure.gem.pearl", [2, 6]),
      },
      {
        range: "7-8",
        result: () => formatKaratItem("tables.treasure.gem.agate", [2, 6]),
      },
      {
        range: "9",
        result: () => formatKaratItem("tables.treasure.gem.turquoise", [2, 6]),
      },
      {
        range: "10",
        result: () => formatKaratItem("tables.treasure.gem.aventurine", [2, 6]),
      },
      {
        range: "11",
        result: () => formatKaratItem("tables.treasure.gem.tourmaline", [2, 6]),
      },
      {
        range: "12",
        result: () =>
          formatKaratItem("tables.treasure.gem.rockCrystal", [2, 6]),
      },
      {
        range: "13",
        result: () => formatKaratItem("tables.treasure.gem.jade", [2, 6]),
      },
      {
        range: "14",
        result: () => formatKaratItem("tables.treasure.gem.topaz", [2, 6]),
      },
      {
        range: "15",
        result: () => formatKaratItem("tables.treasure.gem.opal", [2, 6]),
      },
      {
        range: "16",
        result: () => formatKaratItem("tables.treasure.gem.amber", [2, 6]),
      },
      {
        range: "17",
        result: () => formatKaratItem("tables.treasure.gem.emerald", [2, 6]),
      },
      {
        range: "18",
        result: () => formatKaratItem("tables.treasure.gem.sapphire", [2, 6]),
      },
      {
        range: "19",
        result: () => formatKaratItem("tables.treasure.gem.ruby", [2, 6]),
      },
      {
        range: "20",
        result: () => formatKaratItem("tables.treasure.gem.diamond", [2, 6]),
      },
    ],
  },
  artefacts: {
    description: tableText("tables.treasure.section.artefacts.description"),
    die: 20,
    entries: [
      {
        range: "1-2",
        result: () =>
          tableTextWithParams("tables.treasure.artefact.spellPotion", {
            quality: rollTotal([1, 6]),
          }),
      },
      {
        range: "3-6",
        result: () =>
          tableTextWithParams("tables.treasure.artefact.healingPotion", {
            quality: rollTotal([1, 6]),
          }),
      },
      {
        range: "7",
        result: () =>
          tableTextWithParams("tables.treasure.artefact.weaponBalm", {
            quality: rollTotal([1, 6]),
          }),
      },
      {
        range: "8",
        result: tableText("tables.treasure.artefact.invisibilityElixir"),
      },
      {
        range: "9",
        result: tableText("tables.treasure.artefact.transformationPotion"),
      },
      {
        range: "10-11",
        result: tableText("tables.treasure.artefact.antidote"),
      },
      {
        range: "12-13",
        result: () =>
          formatValuedItem(
            "tables.treasure.artefact.statuette",
            [2, 20],
            "tables.common.unit.ducats",
          ),
      },
      {
        range: "14-15",
        result: () =>
          formatValuedItem(
            "tables.treasure.artefact.goblet",
            [2, 20],
            "tables.common.unit.ducats",
          ),
      },
      { range: "16-17", result: tableText("tables.treasure.artefact.weapon") },
      { range: "18", result: tableText("tables.treasure.artefact.armor") },
      {
        range: "19-20",
        result: tableText("tables.treasure.artefact.magicArtifact"),
      },
    ],
  },
};

export class TreasureLootTable implements IRandomTable {
  private readonly treasureRolls: IRandomRolls;

  constructor() {
    this.treasureRolls = buildTable(TREASURE_CONFIG, "main");
  }

  private toInline(
    value: LocalizedText | null | undefined,
  ): InlineLocalizedText | null {
    if (value == null) {
      return null;
    }
    if (isInlineLocalizedText(value)) {
      return value;
    }
    const fallback = getFallbackText(value) ?? "";
    return createInlineLocalizedText(fallback);
  }

  roll(): RollOutcome[] {
    const outcomes = this.treasureRolls.roll();
    const combined: RollOutcome[] = [];

    for (let index = 0; index < outcomes.length; index++) {
      const entry = outcomes[index]!;

      if (entry.meta?.tableKey === "jewellery") {
        const materialParts: {
          de: string;
          en: string;
        }[] = [];
        let cursor = index + 1;

        while (
          cursor < outcomes.length &&
          (outcomes[cursor]?.meta?.tableKey === "jewelleryMaterial" ||
            outcomes[cursor]?.meta?.tableKey === "jewellerySpecialMaterial")
        ) {
          const detail = outcomes[cursor];
          const detailResult = this.toInline(detail?.result);
          if (detailResult) {
            const de = resolveInlineText(detailResult, "de");
            const en = resolveInlineText(detailResult, "en");
            if (de || en) {
              materialParts.push({ de, en });
            }
          }
          cursor += 1;
        }

        const entryResult = this.toInline(entry.result);
        const baseDe = entryResult ? resolveInlineText(entryResult, "de") : "";
        const baseEn = entryResult ? resolveInlineText(entryResult, "en") : "";
        const suffixDe = materialParts.length
          ? ` (${materialParts.map((item) => item.de).join(", ")})`
          : "";
        const suffixEn = materialParts.length
          ? ` (${materialParts.map((item) => item.en).join(", ")})`
          : "";

        combined.push({
          ...entry,
          result: createInlineLocalizedText(
            `${baseDe}${suffixDe}`,
            `${baseEn}${suffixEn}`,
          ),
        });
        index = cursor - 1;
        continue;
      }

      combined.push(entry);
    }

    return combined;
  }
}
