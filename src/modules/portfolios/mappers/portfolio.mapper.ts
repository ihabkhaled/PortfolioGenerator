import {
  migratePortfolioDocument,
  tryMigratePortfolioDocument,
  type PortfolioDocument,
} from '@/modules/portfolio-document';

import type { PortfolioRow } from '../types/portfolio-row.types';
import type {
  OwnedPortfolio,
  PortfolioStatus,
  PortfolioSummary,
  PublishedPortfolio,
} from '../types/portfolio.types';

/**
 * Database row to domain object.
 *
 * Every JSONB column passes through migration and validation here, which is
 * the single place stored bytes become trusted data. A row written by an older
 * build, or hand-edited in a console, cannot reach the renderer un-checked.
 */

export function toOwnedPortfolio(row: PortfolioRow): OwnedPortfolio {
  return {
    id: row.id,
    ownerId: row.ownerId,
    slug: row.slug,
    status: row.status as PortfolioStatus,
    templateId: row.templateId,
    draftDocument: migratePortfolioDocument(row.draftDocument),
    draftVersion: row.draftVersion,
    hasPublishedVersion: row.publishedDocument !== null,
    publishedVersion: row.publishedVersion,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Returns null rather than throwing when the stored snapshot fails validation:
 * on the public path a corrupt row must become a 404 for one portfolio, not a
 * 500 for the request.
 */
export function toPublishedPortfolio(row: PortfolioRow): PublishedPortfolio | null {
  if (row.publishedDocument === null || row.publishedVersion === null || row.publishedAt === null) {
    return null;
  }

  const document = tryMigratePortfolioDocument(row.publishedDocument);

  if (document === null) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    publishedVersion: row.publishedVersion,
    publishedAt: row.publishedAt,
    document,
  };
}

export function toPortfolioSummary(row: PortfolioRow): PortfolioSummary {
  const document = readIdentity(row.draftDocument);

  return {
    id: row.id,
    slug: row.slug,
    status: row.status as PortfolioStatus,
    displayName: document.displayName,
    headline: document.headline,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt,
  };
}

/**
 * Summary rows are listed in the dashboard, where one unparseable draft must
 * not blank the whole list. Falls back to placeholders the user can recognise
 * and open.
 */
export function readIdentity(draftDocument: unknown): PortfolioDocument['identity'] {
  const document = tryMigratePortfolioDocument(draftDocument);

  if (document === null) {
    return {
      displayName: '',
      headline: '',
      summary: null,
      location: null,
      portraitAssetId: null,
      availabilityEnabled: false,
    };
  }

  return document.identity;
}
