export type AttributeKey =
  | "MU"
  | "KL"
  | "IN"
  | "CH"
  | "FF"
  | "GE"
  | "KO"
  | "KK";

export type AttributeSet = Partial<Record<AttributeKey, number>>;

export interface ResourcePools {
  lep?: number | null;
  asp?: number | null;
  kap?: number | null;
  ini?: string | null;
  aw?: number | null;
  sk?: number | null;
  zk?: number | null;
  gs?: number | null;
}

export interface WeaponStats {
  readonly name: string;
  readonly category: "melee" | "ranged" | "unarmed" | "unknown";
  readonly attack?: number | null;
  readonly parry?: number | null;
  readonly rangedAttack?: number | null;
  readonly damage?: string | null;
  readonly range?: string | null;
  readonly load?: string | null;
  readonly reach?: string | null;
  readonly notes?: string | null;
  readonly raw: Record<string, string>;
  readonly rawInput: string;
}

export interface ArmorStats {
  readonly rs: number | null;
  readonly be: number | null;
  readonly description: string | null;
  readonly notes: string | null;
  readonly raw: string;
}

export interface TalentRating {
  readonly name: string;
  readonly value: number;
}

export interface RatedEntry {
  readonly name: string;
  readonly value: number;
}

export interface ParserWarning {
  readonly type: "missing-section" | "parse-error";
  readonly section?: string;
  readonly message: string;
}

export interface ParsedStatBlock {
  readonly name: string;
  readonly attributes: AttributeSet;
  readonly pools: ResourcePools;
  readonly armor?: ArmorStats | null;
  readonly actions?: number | null;
  readonly weapons: readonly WeaponStats[];
  readonly combatTechniques: readonly RatedEntry[];
  readonly advantages: readonly string[];
  readonly disadvantages: readonly string[];
  readonly specialAbilities: readonly string[];
  readonly combatSpecialAbilities: readonly string[];
  readonly languages: readonly string[];
  readonly scripts: readonly string[];
  readonly spells: readonly RatedEntry[];
  readonly liturgies: readonly RatedEntry[];
  readonly rituals: readonly RatedEntry[];
  readonly blessings: readonly string[];
  readonly equipment: readonly string[];
  readonly talents: readonly TalentRating[];
  readonly notes: Readonly<Record<string, string>>;
  readonly extras: readonly string[];
}

export interface ParseResult {
  readonly model: ParsedStatBlock;
  readonly warnings: readonly ParserWarning[];
  readonly normalizedSource: string;
}
