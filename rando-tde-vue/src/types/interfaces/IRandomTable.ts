export interface IRandomTable {
  roll(): { description: string | null; result: string | null }[];
}
