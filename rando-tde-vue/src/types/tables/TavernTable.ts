import { Dice } from "../Dice";
import type { IRandomRoll } from "../interfaces/IRandomRoll";
import type { IRandomRolls } from "../interfaces/IRandomRolls";
import type { IRandomTable } from "../interfaces/IRandomTable";
import { RandomRolls } from "../RandomRoll/RandomRolls";
export class TavernTable implements IRandomTable {
  tavernRolls: IRandomRolls;

  constructor() {
    const tavernProperNameSpecial1Array: IRandomRoll[] = [
      { rollChance: [1], result: "Berghof", followupRolls: null },
      { rollChance: [2], result: "Waldhof", followupRolls: null },
      { rollChance: [3], result: "Lindenhof", followupRolls: null },
      { rollChance: [4], result: "Eichenhof", followupRolls: null },
      { rollChance: [5], result: "Kaiserhof", followupRolls: null },
      { rollChance: [6], result: "Reichshof", followupRolls: null },
    ];

    const tavernProperNameSpecial1Rolls = new RandomRolls(null, 6, tavernProperNameSpecial1Array);

    const tavernProperNameSpecial2Array: IRandomRoll[] = [
      { rollChance: [1], result: "Valpostube", followupRolls: null },
      { rollChance: [2], result: "Bei Alrik", followupRolls: null },
      { rollChance: [3], result: "Ums Eck", followupRolls: null },
      { rollChance: [4], result: "Bierschwemme", followupRolls: null },
      { rollChance: [5], result: "Travias Einkehr", followupRolls: null },
      { rollChance: [6], result: "Zum Anker", followupRolls: null },
    ];

    const tavernProperNameSpecial2Rolls = new RandomRolls(null, 6, tavernProperNameSpecial2Array);

    const tavernProperNameArray: IRandomRoll[] = [
      { rollChance: [1], result: "Einhorn", followupRolls: null },
      { rollChance: [2], result: "Stier", followupRolls: null },
      { rollChance: [3], result: "Hirsch", followupRolls: null },
      { rollChance: [4], result: "König", followupRolls: null },
      { rollChance: [5], result: "Prinzessin", followupRolls: null },
      { rollChance: [6], result: "Keiler", followupRolls: null },
      { rollChance: [7], result: "Adler", followupRolls: null },
      { rollChance: [8], result: "Krone", followupRolls: null },
      { rollChance: [9], result: "Henker", followupRolls: null },
      { rollChance: [10], result: "Reisenden", followupRolls: null },
      { rollChance: [11], result: "Qualle", followupRolls: null },
      { rollChance: [12], result: "Delphin", followupRolls: null },
      { rollChance: [13], result: "Karpfen", followupRolls: null },
      { rollChance: [14], result: "Pony", followupRolls: null },
      { rollChance: [15], result: "Stiefel", followupRolls: null },
      { rollChance: [16], result: "Vagabunden", followupRolls: null },
      { rollChance: [17], result: "Stute", followupRolls: null },
      { rollChance: [18], result: "Eimer", followupRolls: null },
      { rollChance: [19], result: "Pilger", followupRolls: null },
      { rollChance: [20], result: "Trommel", followupRolls: null },
    ];

    const tavernProperNameRolls = new RandomRolls(null, 20, tavernProperNameArray);

    const tavernNamePrefixArray: IRandomRoll[] = [
      { rollChance: [1], result: "Zum/ Zur goldenen", followupRolls: [tavernProperNameRolls] },
      { rollChance: [2], result: "Zum/ Zur almadinenen", followupRolls: [tavernProperNameRolls] },
      { rollChance: [3], result: "Zum/ Zur tanzenden", followupRolls: [tavernProperNameRolls] },
      { rollChance: [4], result: "Zum/ Zur lachenden", followupRolls: [tavernProperNameRolls] },
      { rollChance: [5], result: "Zum/ Zur betrunkenen", followupRolls: [tavernProperNameRolls] },
      { rollChance: [6], result: "Zum/ Zur fröhlichen", followupRolls: [tavernProperNameRolls] },
      { rollChance: [7], result: "Zum/ Zur glücklichen", followupRolls: [tavernProperNameRolls] },
      { rollChance: [8], result: "Zum/ Zur springenden", followupRolls: [tavernProperNameRolls] },
      { rollChance: [9], result: "Zum/ Zur schwarzen", followupRolls: [tavernProperNameRolls] },
      { rollChance: [10], result: "Zum/ Zur weißen", followupRolls: [tavernProperNameRolls] },
      { rollChance: [11], result: "Zum/ Zur tänzelnden", followupRolls: [tavernProperNameRolls] },
      { rollChance: [12], result: "Zum/ Zur einsamen", followupRolls: [tavernProperNameRolls] },
      { rollChance: [13], result: "Des Kaisers", followupRolls: [tavernProperNameRolls] },
      { rollChance: [14], result: "Die zwei <Nachfolgendes im Plural>", followupRolls: [tavernProperNameRolls] },
      { rollChance: [15], result: "Die drei <Nachfolgendes im Plural>", followupRolls: [tavernProperNameRolls] },
      { rollChance: [16], result: "Die vier <Nachfolgendes im Plural>", followupRolls: [tavernProperNameRolls] },
      { rollChance: [17, 18], result: null, followupRolls: [tavernProperNameSpecial1Rolls] },
      { rollChance: [19, 20], result: null, followupRolls: [tavernProperNameSpecial2Rolls] },
    ];

    const tavernNamePrefixRolls = new RandomRolls("Name", 20, tavernNamePrefixArray);



    const travernRollArray: IRandomRoll[] = [{ rollChance: [1], result: null, followupRolls: [tavernNamePrefixRolls] }];

    this.tavernRolls = new RandomRolls("Gaststube/Taverne", 1, travernRollArray);
  }

  roll(): { description: string | null; result: string|null }[] {
    const rollResult = this.tavernRolls.roll();
    return rollResult;
  }
}
