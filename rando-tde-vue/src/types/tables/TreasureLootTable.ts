import { Dice } from "../Dice";
import type { IRandomRoll } from "../interfaces/IRandomRoll";
import type { IRandomRolls } from "../interfaces/IRandomRolls";
import type { IRandomTable } from "../interfaces/IRandomTable";
import { RandomRolls } from "../RandomRoll/RandomRolls";
export class TreasureLootTable implements IRandomTable {
  treasureRolls: IRandomRolls;

  constructor() {
    const treasureCoinRollArray: IRandomRoll[] = [
      { rollChance: [1], result: Dice.roll(3, 20) + " Kreuzer", followupRolls: null },
      { rollChance: [2, 3], result: Dice.roll(3, 20) + " Heller", followupRolls: null },
      { rollChance: [4, 5, 6], result: Dice.roll(3, 20) + " Silbertaler", followupRolls: null },
      { rollChance: [7, 8], result: Dice.roll(3, 20) + " Dukaten", followupRolls: null },
      { rollChance: [9], result: Dice.roll(1, 20) + " Kreuzer, " + Dice.roll(1, 20) + " Heller", followupRolls: null },
      { rollChance: [10, 11, 12], result: Dice.roll(1, 20) + " Kreuzer, " + Dice.roll(1, 20) + " Heller, " + Dice.roll(1, 20) + " Silbertaler", followupRolls: null },
      { rollChance: [13, 14], result: Dice.roll(1, 20) + " Kreuzer, " + Dice.roll(1, 20) + " Heller, " + Dice.roll(1, 20) + " Silbertaler, " + Dice.roll(1, 20) + " Dukaten", followupRolls: null },
      { rollChance: [15, 16], result: Dice.roll(2, 20) + " Silbertaler, " + Dice.roll(2, 20) + " Dukaten", followupRolls: null },
      { rollChance: [17, 18], result: Dice.roll(1, 20) + " Kreuzer, " + Dice.roll(1, 20) + " Heller, " + Dice.roll(1, 20) + " Silbertaler, " + Dice.roll(1, 20) + " Dukaten", followupRolls: null },
      { rollChance: [19, 20], result: Dice.roll(5, 20) + " Dukaten", followupRolls: null },
    ];
    const treasureCoinRolls = new RandomRolls("Münzen", 20, treasureCoinRollArray);

    const treasureJewellerySpecialMaterialArray: IRandomRoll[] = [
      { rollChance: [1], result: "Illuminium", followupRolls: null },
      { rollChance: [2], result: "Cupritan", followupRolls: null },
      { rollChance: [3, 4], result: "Meteoreisen", followupRolls: null },
      { rollChance: [5], result: "Mindorium", followupRolls: null },
      { rollChance: [6], result: "Arkanium", followupRolls: null },
    ];
    const treasureJewellerySpecialMaterialRoll = new RandomRolls(null, 6, treasureJewellerySpecialMaterialArray);

    const treasureJewelleryMaterialArray: IRandomRoll[] = [
      { rollChance: [1, 2], result: "Eisen", followupRolls: null },
      { rollChance: [3, 4], result: "Zinn", followupRolls: null },
      { rollChance: [5], result: "Messing", followupRolls: null },
      { rollChance: [6, 7], result: "Bronze", followupRolls: null },
      { rollChance: [8, 9], result: "Kupfer", followupRolls: null },
      { rollChance: [10, 11, 12, 13], result: "Silber", followupRolls: null },
      { rollChance: [14, 15, 16, 17], result: "Gold", followupRolls: null },
      { rollChance: [18], result: "Elektrum", followupRolls: null },
      { rollChance: [19], result: "Mondsilber", followupRolls: null },
      { rollChance: [20], result: "besonderes Metall", followupRolls: [treasureJewellerySpecialMaterialRoll] },
    ];
    const treasureJewelleryMaterialRolls = new RandomRolls(null, 20, treasureJewelleryMaterialArray);

    const treasureJewelleryArray: IRandomRoll[] = [
      { rollChance: [1, 2, 3, 4], result: "Amulett", followupRolls: [treasureJewelleryMaterialRolls] },
      { rollChance: [5, 6], result: "Armreif", followupRolls: [treasureJewelleryMaterialRolls] },
      { rollChance: [7, 8], result: "Brosche", followupRolls: [treasureJewelleryMaterialRolls] },
      { rollChance: [9], result: "Diadem", followupRolls: [treasureJewelleryMaterialRolls] },
      { rollChance: [10, 11, 12, 13], result: "Kette", followupRolls: [treasureJewelleryMaterialRolls] },
      { rollChance: [14, 15, 16], result: "Ohrring", followupRolls: [treasureJewelleryMaterialRolls] },
      { rollChance: [17, 18, 19, 20], result: "Ring", followupRolls: [treasureJewelleryMaterialRolls] },
    ];
    const treasureJewelleryRolls = new RandomRolls("Schmuck", 20, treasureJewelleryArray);

    const treasureGemsArray: IRandomRoll[] = [
      { rollChance: [1, 2], result: "Speckstein (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [3, 4], result: "Obsidian (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [5, 6], result: "Perle (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [7, 8], result: "Achat (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [9], result: "Türkis (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [10], result: "Aventurin (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [11], result: "Turmalin (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [12], result: "Bergkristall (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [13], result: "Jade (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [14], result: "Topas (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [15], result: "Opal (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [16], result: "Bernstein (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [17], result: "Smaragd (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [18], result: "Saphir (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [19], result: "Rubin (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
      { rollChance: [20], result: "Diamant (" + Dice.roll(2, 6) + " Karat)", followupRolls: null },
    ];
    const treasureGemsRolls = new RandomRolls("Edelsteine", 20, treasureGemsArray);

    const treasureArtefactArray: IRandomRoll[] = [
      { rollChance: [1, 2], result: "Zaubertrank (QS " + Dice.roll(1, 6) + ")", followupRolls: null },
      { rollChance: [3, 4, 5, 6], result: "Heiltrank (QS " + Dice.roll(1, 6) + ")", followupRolls: null },
      { rollChance: [7], result: "Waffenbalsam (QS " + Dice.roll(1, 6) + ")", followupRolls: null },
      { rollChance: [8], result: "Unsichtbarkeitselixier", followupRolls: null },
      { rollChance: [9], result: "Verwandlungstrank", followupRolls: null },
      { rollChance: [10, 11], result: "Antidot", followupRolls: null },
      { rollChance: [12, 13], result: "Statuette (" + Dice.roll(2, 20) + " Dukaten)", followupRolls: null },
      { rollChance: [14, 15], result: "Pokal (" + Dice.roll(2, 20) + " Dukaten)", followupRolls: null },
      { rollChance: [16, 17], result: "Waffe", followupRolls: null },
      { rollChance: [18], result: "Rüstung", followupRolls: null },
      { rollChance: [19, 20], result: "magisches Artefakt", followupRolls: null },
    ];

    const treasureArtefactRolls = new RandomRolls("Artefakte", 20, treasureArtefactArray);

    const treasureRollArray: IRandomRoll[] = [
      { rollChance: [1, 2, 3], result: "Münzen", followupRolls: [treasureCoinRolls] },
      { rollChance: [4, 5, 6, 7, 8], result: "Schmuck", followupRolls: [treasureJewelleryRolls] },
      { rollChance: [9, 10, 11, 12], result: "Edelsteine", followupRolls: [treasureGemsRolls] },
      { rollChance: [13, 14], result: "Münzen und Schmuck", followupRolls: [treasureCoinRolls, treasureJewelleryRolls] },
      { rollChance: [15, 16], result: "Münzen und Edelsteine", followupRolls: [treasureCoinRolls, treasureGemsRolls] },
      { rollChance: [17, 18], result: "Schmuck und Edelsteine", followupRolls: [treasureJewelleryRolls, treasureGemsRolls] },
      { rollChance: [19], result: "Münzen, Schmuck und Edelsteine", followupRolls: [treasureCoinRolls, treasureJewelleryRolls, treasureGemsRolls] },
      { rollChance: [20], result: "Artefakte", followupRolls: [treasureArtefactRolls] },
    ];

    this.treasureRolls = new RandomRolls("Zusammenstellung des Schatzes", 20, treasureRollArray);
  }
  roll(): { description: string | null; result: string|null }[] {
    const rollResult = this.treasureRolls.roll();
    return rollResult;
  }
}
