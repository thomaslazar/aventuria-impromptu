import type { ConversionResultPayload } from "./converter";

export interface WarningSummary {
  readonly total: number;
  readonly parser: number;
  readonly resolver: number;
  readonly exporter: number;
  readonly unresolved: number;
}

export interface CachedConversionEntry {
  readonly id: string;
  readonly createdAt: string;
  readonly name: string;
  readonly statBlock: string;
  readonly payload: ConversionResultPayload;
  readonly warningSummary: WarningSummary;
}

export type CacheBackend = "indexedDB" | "localStorage" | "none";

export type CacheStatus = "uninitialized" | "available" | "disabled";

export interface CacheState {
  readonly status: CacheStatus;
  readonly backend: CacheBackend;
}

export interface CacheChangeDetail {
  readonly entries: readonly CachedConversionEntry[];
  readonly state: CacheState;
}

export type CacheChangeEvent = CustomEvent<CacheChangeDetail>;
