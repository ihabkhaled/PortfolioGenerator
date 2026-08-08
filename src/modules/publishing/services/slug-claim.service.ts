import 'server-only';

import { recordAuditEvent } from '@/modules/audit/server';
import {
  getOwnedPortfolio,
  isSlugAvailable,
  portfolioCacheTag,
  updateOwnedSlug,
} from '@/modules/portfolios/server';
import { invalidateTagImmediately } from '@/packages/cache';

import { PUBLISH_FAILURES } from '../constants/publish.constants';
import { validateSlug } from '../policies/slug.policy';
import type { PublishOutcome, SlugAvailability } from '../types/publish.types';

/**
 * Slug availability, for the editor's live check.
 *
 * Explicitly advisory. Two users can both be told "available" for the same slug
 * within the same second, and only one of them can win — the unique constraint
 * in `updateOwnedSlug` decides, not this. Treating this answer as authoritative
 * is the bug this comment exists to prevent.
 */
export async function checkSlugAvailability(
  ownerId: string,
  portfolioId: string,
  candidate: string,
): Promise<SlugAvailability> {
  const validation = validateSlug(candidate);

  if (!validation.ok) {
    return { slug: candidate, available: false, rejection: validation.reason };
  }

  const owned = await getOwnedPortfolio(ownerId, portfolioId);

  if (owned === null) {
    return { slug: validation.slug, available: false, rejection: 'not-found' };
  }

  // A portfolio's own slug is always "available" to it, so re-saving an
  // unchanged form does not tell the user their address is taken by themselves.
  if (owned.slug === validation.slug) {
    return { slug: validation.slug, available: true, rejection: null };
  }

  const available = await isSlugAvailable(validation.slug, portfolioId);

  return { slug: validation.slug, available, rejection: null };
}

/**
 * Claim a slug.
 *
 * The old address must stop serving the moment the new one starts, so both
 * cache tags are invalidated. Leaving the old tag alone would keep the previous
 * URL serving a portfolio that has moved — indistinguishable, to a visitor,
 * from the portfolio still being there.
 */
export async function claimSlug(
  ownerId: string,
  portfolioId: string,
  candidate: string,
): Promise<PublishOutcome> {
  const validation = validateSlug(candidate);

  if (!validation.ok) {
    return { ok: false, failure: PUBLISH_FAILURES.invalidSlug };
  }

  const previous = await getOwnedPortfolio(ownerId, portfolioId);

  if (previous === null) {
    return { ok: false, failure: PUBLISH_FAILURES.notFound };
  }

  if (previous.slug === validation.slug) {
    return { ok: true, slug: validation.slug, publishedVersion: previous.publishedVersion };
  }

  const result = await updateOwnedSlug(ownerId, portfolioId, validation.slug);

  if (!result.ok) {
    return {
      ok: false,
      failure:
        result.reason === 'slug-taken' ? PUBLISH_FAILURES.slugTaken : PUBLISH_FAILURES.notFound,
    };
  }

  invalidateTagImmediately(portfolioCacheTag(previous.slug));
  invalidateTagImmediately(portfolioCacheTag(validation.slug));

  await recordAuditEvent({
    eventType: 'portfolio.slug_changed',
    ownerId,
    portfolioId,
    metadata: { from: previous.slug, to: validation.slug },
  });

  return {
    ok: true,
    slug: validation.slug,
    publishedVersion: result.value.publishedVersion,
  };
}
