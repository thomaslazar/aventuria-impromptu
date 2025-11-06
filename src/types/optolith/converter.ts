import type { OptolithExport } from "../../services/optolith/exporter";
import type { OptolithDatasetManifest } from "../optolith/manifest";
import type { ParserWarning } from "../optolith/stat-block";
import type { ResolutionWarning } from "../../services/optolith/resolver";

export interface EquipmentSummaryWeapon {
  readonly name: string;
  readonly templateId?: string;
  readonly combatTechniqueId?: string;
  readonly fallback?: "unarmed";
  readonly unresolved?: boolean;
}

export interface EquipmentSummaryArmor {
  readonly name: string;
  readonly templateId?: string;
  readonly protection?: number | null;
  readonly encumbrance?: number | null;
  readonly unresolved?: boolean;
}

export interface EquipmentSummaryItem {
  readonly name: string;
  readonly templateId?: string;
  readonly unresolved?: boolean;
}

export interface EquipmentSummary {
  readonly weapons: readonly EquipmentSummaryWeapon[];
  readonly armor: EquipmentSummaryArmor | null;
  readonly gear: readonly EquipmentSummaryItem[];
}

export interface ConversionResultPayload {
  readonly exported: OptolithExport;
  readonly exportedWarnings: readonly string[];
  readonly manifest: OptolithDatasetManifest;
  readonly normalizedSource: string;
  readonly parserWarnings: readonly ParserWarning[];
  readonly resolverWarnings: readonly ResolutionWarning[];
  readonly unresolved: Readonly<Record<string, readonly string[]>>;
  readonly equipmentSummary: EquipmentSummary;
}

export interface ConversionRequestMessage {
  readonly type: "convert";
  readonly payload: {
    readonly source: string;
    readonly baseUrl: string;
  };
}

export interface ConversionSuccessMessage {
  readonly type: "result";
  readonly payload: ConversionResultPayload;
}

export interface ConversionErrorMessage {
  readonly type: "error";
  readonly error: string;
}

export type ConverterWorkerMessage =
  | ConversionSuccessMessage
  | ConversionErrorMessage;
