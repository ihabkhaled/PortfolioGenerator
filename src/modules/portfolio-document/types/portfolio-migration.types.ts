/**
 * One step in the document migration chain.
 *
 * Steps are ordered and version-to-version rather than "upgrade to latest",
 * so a document written three versions ago walks the same path every other
 * document walked, and each step can be tested in isolation against a fixture
 * from its own era.
 */
export interface DocumentMigrationStep {
  readonly from: number;
  readonly to: number;
  readonly upgrade: (document: unknown) => unknown;
}
