import { Dice } from "../Dice";
import type { IRandomRoll } from "../interfaces/IRandomRoll";
import type { IRandomRolls } from "../interfaces/IRandomRolls";
import type { IRandomTable } from "../interfaces/IRandomTable";
import { RandomRolls } from "../RandomRoll/RandomRolls";
export class NpcLootTable implements IRandomTable {
  npcRolls: IRandomRolls;

  constructor() {
    const npcMoneyRollArray: IRandomRoll[] = [
      {
        rollChance: [1, 2, 3, 4, 5],
        result: Dice.roll(4, 6) + " Kreuzer, " + Dice.roll(2, 6) + " Heller",
        followupRolls: null,
      },
      {
        rollChance: [6, 7, 8],
        result:
          Dice.roll(2, 6) +
          " Kreuzer, " +
          Dice.roll(2, 6) +
          " Heller, " +
          Dice.roll(1, 3) +
          " Silbertaler",
        followupRolls: null,
      },
      {
        rollChance: [9, 10, 11, 12, 13],
        result:
          Dice.roll(1, 6) +
          " Kreuzer, " +
          Dice.roll(1, 6) +
          " Heller, " +
          Dice.roll(1, 6) +
          " Silbertaler, " +
          Dice.roll(1, 3) +
          " Dukaten",
        followupRolls: null,
      },
      {
        rollChance: [14, 15, 16, 17],
        result:
          Dice.roll(1, 6) +
          " Heller, " +
          Dice.roll(2, 6) +
          " Silbertaler, " +
          Dice.roll(1, 6) +
          " Dukaten",
        followupRolls: null,
      },
      {
        rollChance: [18, 19, 20],
        result:
          Dice.roll(2, 6) + " Silbertaler, " + Dice.roll(2, 6) + " Dukaten",
        followupRolls: null,
      },
    ];
    const npcMoneyRolls = new RandomRolls("Geld", 20, npcMoneyRollArray);

    const npcPersonalItemArray: IRandomRoll[] = [
      { rollChance: [1], result: "Augengläser", followupRolls: null },
      { rollChance: [2], result: "Glücksbringer", followupRolls: null },
      {
        rollChance: [3],
        result: "Amulett mit dem Portrait des Geliebten",
        followupRolls: null,
      },
      { rollChance: [4], result: "alte Münze", followupRolls: null },
      { rollChance: [5], result: "Liebesbrief", followupRolls: null },
      {
        rollChance: [6],
        result:
          "Schuldschein der Nordlandbank (" +
          (Dice.roll(2, 20) + 10) +
          " Dukaten)",
        followupRolls: null,
      },
      {
        rollChance: [7],
        result: "Pastillen gegen Halsschmerzen",
        followupRolls: null,
      },
      { rollChance: [8], result: "Wasserschlauch", followupRolls: null },
      { rollChance: [9], result: "Halstuch", followupRolls: null },
      { rollChance: [10], result: "Mütze", followupRolls: null },
      { rollChance: [11], result: "Messer", followupRolls: null },
      { rollChance: [12], result: "Parfümfläschchen", followupRolls: null },
      { rollChance: [13], result: "leere Zunderdose", followupRolls: null },
      { rollChance: [14], result: "Brecheisen", followupRolls: null },
      { rollChance: [15], result: "Handschuhe", followupRolls: null },
      { rollChance: [16], result: "Puderdose", followupRolls: null },
      { rollChance: [17], result: "Ohrringe", followupRolls: null },
      { rollChance: [18], result: "Öllampe", followupRolls: null },
      { rollChance: [19], result: "Brief der Schwester", followupRolls: null },
      { rollChance: [20], result: "Tabakdose", followupRolls: null },
    ];
    const npcPersonalItemRolls = new RandomRolls(
      "Persönliche Gegenstände",
      20,
      npcPersonalItemArray,
    );

    const npcSpecialItemArray: IRandomRoll[] = [
      {
        rollChance: [1],
        result: "Notizzettel mit Geheimnissen",
        followupRolls: null,
      },
      { rollChance: [2], result: "Fusseln", followupRolls: null },
      { rollChance: [3], result: "Fesselseil", followupRolls: null },
      {
        rollChance: [4],
        result: "1 Anwendung Wirselkraut",
        followupRolls: null,
      },
      { rollChance: [5], result: "Fernrohr, einziehbar", followupRolls: null },
      { rollChance: [6], result: "Kompass", followupRolls: null },
      { rollChance: [7], result: "1 Portion Kelmon", followupRolls: null },
      { rollChance: [8], result: "Verbandszeug", followupRolls: null },
      { rollChance: [9], result: "Zauberkreide", followupRolls: null },
      {
        rollChance: [10],
        result: "Kästchen mit " + Dice.roll(1, 6) + " Borbarad-Moskitos",
        followupRolls: null,
      },
      { rollChance: [11], result: "1 Portion Ilmenblatt", followupRolls: null },
      {
        rollChance: [12],
        result: "Brevier der zwölfgöttlichen Unterweisung",
        followupRolls: null,
      },
      {
        rollChance: [13],
        result: "Flasche mit efferdgeweihtem Wasser",
        followupRolls: null,
      },
      { rollChance: [14], result: "kurzer Magierstab", followupRolls: null },
      { rollChance: [15], result: "Heiltrank (QSW4)", followupRolls: null },
      {
        rollChance: [16],
        result: Dice.roll(1, 6) + " Juwelen",
        followupRolls: null,
      },
      { rollChance: [17], result: "1 Anwendung Donf", followupRolls: null },
      { rollChance: [18], result: "Zaubertrank (QS 4)", followupRolls: null },
      { rollChance: [19], result: "magisches Artefakt", followupRolls: null },
      {
        rollChance: [20],
        result: "Namenloses oder dämonisches Artefakt",
        followupRolls: null,
      },
    ];
    const npcSpecialItemRolls = new RandomRolls(
      "Besondere Gegenstände",
      20,
      npcSpecialItemArray,
    );

    const npcRollArray: IRandomRoll[] = [
      {
        rollChance: [1, 2, 3, 4, 5, 6],
        result: "Geld",
        followupRolls: [npcMoneyRolls],
      },
      {
        rollChance: [7, 8, 9],
        result: "Persönlicher Gegenstand",
        followupRolls: [npcPersonalItemRolls],
      },
      {
        rollChance: [10, 11],
        result: "Besondere Gegenstände",
        followupRolls: [npcSpecialItemRolls],
      },
      {
        rollChance: [12, 13, 14, 15],
        result: "Geld und persönlicher Gegenstand",
        followupRolls: [npcMoneyRolls, npcPersonalItemRolls],
      },
      {
        rollChance: [16, 17],
        result: "Geld und besonderer Gegenstand",
        followupRolls: [npcMoneyRolls, npcSpecialItemRolls],
      },
      {
        rollChance: [18, 19],
        result: "Persönlicher und besonderer Gegenstand",
        followupRolls: [npcPersonalItemRolls, npcSpecialItemRolls],
      },
      {
        rollChance: [20],
        result: "Geld, persönlicher und besonderer Gegenstand",
        followupRolls: [
          npcMoneyRolls,
          npcPersonalItemRolls,
          npcSpecialItemRolls,
        ],
      },
    ];

    this.npcRolls = new RandomRolls(
      "Zusammenstellung des Schatzes",
      20,
      npcRollArray,
    );
  }
  roll(): { description: string | null; result: string | null }[] {
    const rollResult = this.npcRolls.roll();
    return rollResult;
  }
}
