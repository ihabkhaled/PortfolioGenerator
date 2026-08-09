import { upgradeDocumentToVersion2 } from '../helpers/portfolio-document-v2.migration';
import type { DocumentMigrationStep } from '../types/portfolio-migration.types';

/**
 * Version 1 `links[].kind` values that name a platform version 2 renders as a
 * mark.
 *
 * Anything not listed here stays a plain link, which is the safe default: an
 * unrecognised kind rendered as an icon would be an unlabelled button. The
 * aliases are the kinds the version 1 extractor and editor actually produced —
 * `code` for a repository, `writing` for a blog — mapped to the platform they
 * almost always meant.
 */
export const DEFAULT_SOCIAL_KIND_BY_LINK_KIND: Readonly<Record<string, string>> = {
  behance: 'behance',
  code: 'github',
  dribbble: 'dribbble',
  facebook: 'facebook',
  github: 'github',
  gitlab: 'gitlab',
  instagram: 'instagram',
  linkedin: 'linkedin',
  medium: 'medium',
  repository: 'github',
  site: 'website',
  stackoverflow: 'stackoverflow',
  telegram: 'telegram',
  threads: 'threads',
  tiktok: 'tiktok',
  twitter: 'x',
  website: 'website',
  whatsapp: 'whatsapp',
  writing: 'medium',
  x: 'x',
  youtube: 'youtube',
};

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
