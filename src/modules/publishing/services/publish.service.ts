import 'server-only';

import { recordAuditEvent } from '@/modules/audit/server';
import { ensureBillingTrialStarted } from '@/modules/payments/server';
import { migratePortfolioDocument } from '@/modules/portfolio-document';
import {
  invalidatePortfolioPdfCache,
  invalidatePortfolioPdfCacheIfChanged,
} from '@/modules/portfolio-pdf/server';
import {
  getOwnedPortfolio,
  portfolioCacheTag,
  publishOwnedPortfolio,
  unpublishOwnedPortfolio,
} from '@/modules/portfolios/server';
import { invalidateTagImmediately } from '@/packages/cache';
import { logger } from '@/packages/logger';

import { PUBLISH_FAILURES } from '../constants/publish.constants';
import { findPublishBlockers } from '../policies/publish-readiness.policy';
import { validateSlug } from '../policies/slug.policy';
import type { PublishOutcome, PublishRequest } from '../types/publish.types';

/**
 * Publishing: draft becomes the public snapshot.
 *
 * The order is the guarantee. The draft is re-validated against the canonical
 * schema *at publish time*, not trusted because it was valid when it was saved:
 * a document can be written by an older build, and the thing about to become
 * public is the one that must be checked. The slug is re-validated for the same
 * reason — the reserved list grows as routes are added, and a slug that was
 * legal last month may collide with a route that now exists.
 *
 * Cache invalidation happens after the write, with read-your-own-writes
 * semantics, so a user who publishes and immediately opens their URL sees the
 * version they just published rather than the previous snapshot.
 */
export async function publishPortfolio(request: PublishRequest): Promise<PublishOutcome> {
  const portfolio = await getOwnedPortfolio(request.ownerId, request.portfolioId);

  if (portfolio === null) {
    return { ok: false, failure: PUBLISH_FAILURES.notFound };
  }

  const slugValidation = validateSlug(portfolio.slug);

  if (!slugValidation.ok) {
    return { ok: false, failure: PUBLISH_FAILURES.invalidSlug };
  }

  let document;

  try {
    document = migratePortfolioDocument(portfolio.draftDocument);
  } catch {
    logger.error('portfolio.publish.invalid_document', { portfolioId: portfolio.id });

    return { ok: false, failure: PUBLISH_FAILURES.invalidDocument };
  }

  const blockers = findPublishBlockers(document);

  if (blockers.length > 0) {
    return { ok: false, failure: PUBLISH_FAILURES.notReady, blockers };
  }

  const result = await publishOwnedPortfolio(
    request.ownerId,
    request.portfolioId,
    document,
    request.now,
  );

  if (!result.ok) {
    return { ok: false, failure: PUBLISH_FAILURES.notFound };
  }

  invalidateTagImmediately(portfolioCacheTag(portfolio.slug));

  // Only if the newly published content actually differs from whatever
  // produced the currently cached PDF — see the function's own comment.
  await invalidatePortfolioPdfCacheIfChanged(portfolio.id, document, request.now);

  await recordAuditEvent({
    eventType: 'portfolio.published',
    ownerId: request.ownerId,
    portfolioId: request.portfolioId,
    metadata: {
      slug: portfolio.slug,
      publishedVersion: result.value.publishedVersion,
    },
  });

  // A no-op after the owner's first-ever publish — see
  // `startOwnerTrialIfUnset`. The 10-day free trial is a property of the
  // account, not of this one portfolio, so it starts the first time *any*
  // portfolio the owner controls goes public.
  await ensureBillingTrialStarted(request.ownerId, request.now);

  return {
    ok: true,
    slug: portfolio.slug,
    publishedVersion: result.value.publishedVersion,
  };
}

/**
 * Unpublishing clears the snapshot and the cache tag together.
 *
 * The draft survives — a user taking their portfolio down has not asked to lose
 * their work, and conflating the two is how a support ticket becomes a data
 * loss incident.
 */
export async function unpublishPortfolio(request: PublishRequest): Promise<PublishOutcome> {
  const portfolio = await getOwnedPortfolio(request.ownerId, request.portfolioId);

  if (portfolio === null) {
    return { ok: false, failure: PUBLISH_FAILURES.notFound };
  }

  const result = await unpublishOwnedPortfolio(request.ownerId, request.portfolioId);

  if (!result.ok) {
    return { ok: false, failure: PUBLISH_FAILURES.notFound };
  }

  invalidateTagImmediately(portfolioCacheTag(portfolio.slug));

  // Unconditional: nothing public remains, so nothing stays cached either —
  // "don't keep old file."
  await invalidatePortfolioPdfCache(portfolio.id);

  await recordAuditEvent({
    eventType: 'portfolio.unpublished',
    ownerId: request.ownerId,
    portfolioId: request.portfolioId,
    metadata: { slug: portfolio.slug },
  });

  return { ok: true, slug: portfolio.slug, publishedVersion: 0 };
}
