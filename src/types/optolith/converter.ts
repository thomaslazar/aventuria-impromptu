import type { OptolithExport } from "../../services/optolith/exporter";
import type { OptolithDatasetManifest } from "../optolith/manifest";
import type { ParserWarning } from "../optolith/stat-block";
import type { ResolutionWarning } from "../../services/optolith/resolver";

export interface ConversionResultPayload {
  readonly exported: OptolithExport;
  readonly manifest: OptolithDatasetManifest;
  readonly normalizedSource: string;
  readonly parserWarnings: readonly ParserWarning[];
  readonly resolverWarnings: readonly ResolutionWarning[];
  readonly unresolved: Readonly<Record<string, readonly string[]>>;
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
