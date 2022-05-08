export interface IRandomTable {
  roll(): { description: string; result: string }[];
}
