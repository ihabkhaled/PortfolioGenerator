import { upgradeDocumentToVersion2 } from '../helpers/portfolio-document-v2.migration';
import type { DocumentMigrationStep } from '../types/portfolio-migration.types';

/**
 * The migration chain, in order.
 *
 * Version-to-version rather than "upgrade to latest", so a document written
 * three versions ago walks the same path every other document walked and each
 * step can be tested in isolation against a fixture from its own era.
 */
export const DOCUMENT_MIGRATION_STEPS: readonly DocumentMigrationStep[] = [
  { from: 1, to: 2, upgrade: upgradeDocumentToVersion2 },
];
