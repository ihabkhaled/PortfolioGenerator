import { upgradeDocumentToVersion2 } from '../helpers/portfolio-document-v2.migration';
import { upgradeDocumentToVersion3 } from '../helpers/portfolio-document-v3.migration';
import { upgradeDocumentToVersion4 } from '../helpers/portfolio-document-v4.migration';
import { upgradeDocumentToVersion5 } from '../helpers/portfolio-document-v5.migration';
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
  { from: 2, to: 3, upgrade: upgradeDocumentToVersion3 },
  { from: 3, to: 4, upgrade: upgradeDocumentToVersion4 },
  { from: 4, to: 5, upgrade: upgradeDocumentToVersion5 },
];
