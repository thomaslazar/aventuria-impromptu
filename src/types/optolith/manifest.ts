export interface OptolithManifestSection {
  /**
   * Unique identifier for the section, e.g. `talents`.
   */
  readonly key: string;
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

export interface DiffEntryChange<T = unknown> {
  readonly id: string;
  readonly before?: T;
  readonly after?: T;
}

export interface OptolithDiffReport {
  readonly generatedAt: string;
  readonly sourceChecksum: string;
  readonly previousChecksum?: string;
  readonly sections: Record<
    string,
    {
      readonly added: readonly DiffEntryChange[];
      readonly removed: readonly DiffEntryChange[];
      readonly changed: readonly DiffEntryChange[];
    }
  >;
}
