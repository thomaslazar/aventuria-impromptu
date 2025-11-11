export type OptolithManifestSectionType = "derived" | "raw";

export interface OptolithManifestSection {
  /**
   * Unique identifier for the section, e.g. `talents`.
   */
  readonly key: string;
  /**
   * Indicates whether the payload contains derived entries (with IDs) or raw data.
   */
  readonly type: OptolithManifestSectionType;
  /**
   * Human readable label mainly for diagnostics.
   */
  readonly label: string;
  /**
   * Relative path to the JSON payload containing the section entries.
   */
  readonly file: string;
  /**
   * Number of entries in the payload file.
   */
  readonly entryCount: number;
  /**
   * Optional notes that help maintainers understand the mapping.
   */
  readonly description?: string;
}

export interface OptolithDatasetManifest {
  readonly schemaVersion: string;
  readonly generatorVersion: string;
  readonly generatedAt: string;
  readonly sourceChecksum: string;
  readonly sourceFileName: string;
  readonly sourceModifiedAt: string;
  readonly locale: string;
  readonly sections: OptolithManifestSection[];
}

export interface DerivedEntity<BasePayload = unknown, LocalePayload = unknown> {
  readonly id: string;
  readonly name: string;
  readonly normalizedName: string;
  readonly base: BasePayload;
  readonly locale: LocalePayload;
  readonly synonyms: readonly string[];
}
