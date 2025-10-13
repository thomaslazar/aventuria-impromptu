export class Dice {
  public static roll(diceNumber: number, diceType: number): number {
    let result = 0;

    for (let i = 0; i < diceNumber; i++) {
      const diceRoll = Math.floor(Math.random() * diceType) + 1;
      result = result + diceRoll;
    }

    return result;
  }
}
