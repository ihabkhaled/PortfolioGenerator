import { tryMigratePortfolioDocument } from '@/modules/portfolio-document';

import { isAppLocale } from '../helpers/locale-path.helper';
import type { TranslationRow, TranslationSnapshot } from '../types/translation.types';

export function toTranslationSnapshot(row: TranslationRow): TranslationSnapshot | null {
  const draftDocument = tryMigratePortfolioDocument(row.draftDocument);
  if (draftDocument === null || !isAppLocale(row.locale) || row.locale === 'en') return null;

  const reviewedDocument =
    row.reviewedDocument === null ? null : tryMigratePortfolioDocument(row.reviewedDocument);
  const publishedDocument =
    row.publishedDocument === null ? null : tryMigratePortfolioDocument(row.publishedDocument);
  if (reviewedDocument === null && row.reviewedDocument !== null) return null;
  if (publishedDocument === null && row.publishedDocument !== null) return null;

  return { ...row, locale: row.locale, draftDocument, reviewedDocument, publishedDocument };
}
