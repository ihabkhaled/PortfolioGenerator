import 'server-only';

import { createEmptyPortfolioDocument, type PortfolioDocument } from '@/modules/portfolio-document';
import { DbNull, getDatabase } from '@/packages/database';

import { PORTFOLIO_SELECT } from '../constants/portfolio-query.constants';
import {
  toOwnedPortfolio,
  toPortfolioSummary,
  toPublishedPortfolio,
} from '../mappers/portfolio.mapper';
import type {
  CreatePortfolioInput,
  OwnedPortfolio,
  PortfolioSummary,
  PublishedPortfolio,
  SaveDraftInput,
  PortfolioWriteResult,
} from '../types/portfolio.types';

/**
 * Tenant-scoped data access.
 *
 * Every dashboard method takes `ownerId` as its first argument and puts it in
 * the WHERE clause. There is deliberately no `findById(id)` — the shape that
 * invites "load now, check ownership later", which is how cross-tenant reads
 * get shipped. The two genuinely tenant-free lookups carry an `Unscoped`
 * suffix, and the `no-unscoped-repository-access` lint rule confines them to
 * the public read path.
 */

export async function listOwnedPortfolios(ownerId: string): Promise<readonly PortfolioSummary[]> {
  const rows = await getDatabase().portfolio.findMany({
    where: { ownerId, deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    select: PORTFOLIO_SELECT,
  });

  return rows.map((row) => toPortfolioSummary(row));
}

export async function getOwnedPortfolio(
  ownerId: string,
  portfolioId: string,
): Promise<OwnedPortfolio | null> {
  const row = await getDatabase().portfolio.findFirst({
    where: { id: portfolioId, ownerId, deletedAt: null },
    select: PORTFOLIO_SELECT,
  });

  return row === null ? null : toOwnedPortfolio(row);
}

export async function createPortfolio(input: CreatePortfolioInput): Promise<OwnedPortfolio> {
  const document = createEmptyPortfolioDocument(input.displayName);

  const row = await getDatabase().portfolio.create({
    data: {
      ownerId: input.ownerId,
      slug: input.slug,
      draftDocument: document,
      templateId: document.theme.templateId,
    },
    select: PORTFOLIO_SELECT,
  });

  return toOwnedPortfolio(row);
}

/**
 * Optimistic concurrency in one statement: the expected version is part of the
 * WHERE clause, so two concurrent saves cannot both succeed and the loser is
 * told to reload rather than silently overwriting the winner.
 */
export async function saveDraftDocument(
  input: SaveDraftInput,
): Promise<PortfolioWriteResult<OwnedPortfolio>> {
  const updated = await getDatabase().portfolio.updateMany({
    where: {
      id: input.portfolioId,
      ownerId: input.ownerId,
      deletedAt: null,
      draftVersion: input.expectedVersion,
    },
    data: {
      draftDocument: input.document,
      draftVersion: { increment: 1 },
      templateId: input.document.theme.templateId,
    },
  });

  if (updated.count === 0) {
    const current = await getOwnedPortfolio(input.ownerId, input.portfolioId);

    if (current === null) {
      return { ok: false, reason: 'not-found' };
    }

    return { ok: false, reason: 'version-conflict', currentVersion: current.draftVersion };
  }

  const saved = await getOwnedPortfolio(input.ownerId, input.portfolioId);

  return saved === null ? { ok: false, reason: 'not-found' } : { ok: true, value: saved };
}

export async function updateOwnedSlug(
  ownerId: string,
  portfolioId: string,
  slug: string,
): Promise<PortfolioWriteResult<OwnedPortfolio>> {
  const owned = await getOwnedPortfolio(ownerId, portfolioId);

  if (owned === null) {
    return { ok: false, reason: 'not-found' };
  }

  try {
    const row = await getDatabase().portfolio.update({
      where: { id: portfolioId },
      data: { slug },
      select: PORTFOLIO_SELECT,
    });

    return { ok: true, value: toOwnedPortfolio(row) };
  } catch {
    // The unique index is the authority on slug ownership. An availability
    // check earlier in the flow is advisory only — two users can both be told
    // "available" and only one can win here.
    return { ok: false, reason: 'slug-taken' };
  }
}

export async function publishOwnedPortfolio(
  ownerId: string,
  portfolioId: string,
  document: PortfolioDocument,
  publishedAt: Date,
): Promise<PortfolioWriteResult<OwnedPortfolio>> {
  const updated = await getDatabase().portfolio.updateMany({
    where: { id: portfolioId, ownerId, deletedAt: null },
    data: {
      publishedDocument: document,
      publishedVersion: { increment: 1 },
      publishedAt,
      status: 'PUBLISHED',
    },
  });

  if (updated.count === 0) {
    return { ok: false, reason: 'not-found' };
  }

  const saved = await getOwnedPortfolio(ownerId, portfolioId);

  return saved === null ? { ok: false, reason: 'not-found' } : { ok: true, value: saved };
}

/**
 * Unpublishing clears the snapshot rather than flipping a flag. A row that
 * still holds the published document is one bug away from serving it, and the
 * draft — which the user keeps — is stored separately anyway.
 */
export async function unpublishOwnedPortfolio(
  ownerId: string,
  portfolioId: string,
): Promise<PortfolioWriteResult<OwnedPortfolio>> {
  const updated = await getDatabase().portfolio.updateMany({
    where: { id: portfolioId, ownerId, deletedAt: null },
    data: {
      // `DbNull` writes SQL NULL. `JsonNull` would store the JSON value `null`,
      // which reads back as "published, with a null document" — the exact
      // ambiguity that leaves an unpublished portfolio one bug from serving.
      publishedDocument: DbNull,
      publishedAt: null,
      status: 'UNPUBLISHED',
    },
  });

  if (updated.count === 0) {
    return { ok: false, reason: 'not-found' };
  }

  const saved = await getOwnedPortfolio(ownerId, portfolioId);

  return saved === null ? { ok: false, reason: 'not-found' } : { ok: true, value: saved };
}

export async function softDeleteOwnedPortfolio(
  ownerId: string,
  portfolioId: string,
  deletedAt: Date,
): Promise<boolean> {
  const updated = await getDatabase().portfolio.updateMany({
    where: { id: portfolioId, ownerId, deletedAt: null },
    data: { deletedAt, publishedAt: null, status: 'UNPUBLISHED' },
  });

  return updated.count > 0;
}

/**
 * Public read. Tenant-free by definition — an anonymous visitor has no owner —
 * which is why the name says so and the lint rule keeps it out of dashboard
 * code. Returns null for a draft, an unpublished, or a soft-deleted portfolio,
 * so "does not exist" and "not published" are indistinguishable to a caller.
 */
export async function findPublishedBySlugUnscoped(
  slug: string,
): Promise<PublishedPortfolio | null> {
  const row = await getDatabase().portfolio.findFirst({
    where: { slug, status: 'PUBLISHED', deletedAt: null },
    select: PORTFOLIO_SELECT,
  });

  return row === null ? null : toPublishedPortfolio(row);
}

/** Sitemap source: published, non-deleted portfolios only. */
export async function listPublishedPortfoliosUnscoped(): Promise<readonly PublishedPortfolio[]> {
  const rows = await getDatabase().portfolio.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    orderBy: { publishedAt: 'desc' },
    select: PORTFOLIO_SELECT,
  });

  return rows
    .map((row) => toPublishedPortfolio(row))
    .filter((portfolio): portfolio is PublishedPortfolio => portfolio !== null);
}

/** Availability check for the slug editor. Advisory: publish is authoritative. */
export async function isSlugAvailable(slug: string, excludePortfolioId: string): Promise<boolean> {
  const existing = await getDatabase().portfolio.findFirst({
    where: { slug, id: { not: excludePortfolioId } },
    select: { id: true },
  });

  return existing === null;
}
