import 'server-only';

import { recordAuditEvent } from '@/modules/audit/server';
import {
  getOwnedPortfolio,
  listOwnedSlugs,
  portfolioCacheTag,
  softDeleteOwnedPortfolio,
} from '@/modules/portfolios/server';
import {
  listOwnedUploadKeys,
  listOwnedUploadKeysForPortfolio,
  softDeleteUploadsForPortfolio,
} from '@/modules/resume-ingestion/server';
import { getObjectStorage } from '@/modules/storage/server';
import { invalidateTagImmediately } from '@/packages/cache';
import { logger } from '@/packages/logger';

import { DELETION_FAILURES } from '../constants/deletion.constants';
import { hardDeleteUser } from '../repositories/account.repository';
import type { DeletionOutcome, DeletionSummary } from '../types/deletion.types';

/**
 * Deleting a portfolio.
 *
 * The order matters and it is: stop serving, then remove the files, then mark
 * the rows. Taking the page down first means that even if the object sweep
 * fails halfway, nothing private is reachable — the failure mode is orphaned
 * bytes in a bucket, not a portfolio that is still public after the user
 * deleted it.
 *
 * The row is soft-deleted rather than dropped. The published slug must stay
 * claimed: releasing it immediately would let anyone re-register the address
 * someone's CV, business cards and email signature still point at.
 */
export async function deletePortfolio(
  ownerId: string,
  portfolioId: string,
  now: Date,
): Promise<DeletionOutcome> {
  const portfolio = await getOwnedPortfolio(ownerId, portfolioId);

  if (portfolio === null) {
    return { ok: false, failure: DELETION_FAILURES.notFound };
  }

  const removed = await softDeleteOwnedPortfolio(ownerId, portfolioId, now);

  if (!removed) {
    return { ok: false, failure: DELETION_FAILURES.notFound };
  }

  invalidateTagImmediately(portfolioCacheTag(portfolio.slug));

  const keys = await listOwnedUploadKeysForPortfolio(ownerId, portfolioId);
  const objects = await purgeObjects(keys);
  const uploads = await softDeleteUploadsForPortfolio(ownerId, portfolioId, now);

  await recordAuditEvent({
    eventType: 'portfolio.deleted',
    ownerId,
    portfolioId,
    metadata: {
      slug: portfolio.slug,
      uploads,
      ...objects,
    },
  });

  return { ok: true, summary: { portfolios: 1, uploads, ...objects } };
}

/**
 * Deleting an account.
 *
 * Objects first, row second — the reverse of what feels natural, and
 * deliberate. Once the user row is gone the cascade takes the upload rows with
 * it, and with them the only record of which object keys belonged to this
 * person. Deleting the row first would leave their CV files in the bucket with
 * nothing left in the database that knows they should be removed.
 *
 * The audit trail survives: `AuditEvent.ownerId` is `SetNull`, so what happened
 * remains readable while who it happened to does not.
 */
export async function deleteAccount(ownerId: string, now: Date): Promise<DeletionOutcome> {
  const slugs = await listOwnedSlugs(ownerId);
  const keys = await listOwnedUploadKeys(ownerId);
  const objects = await purgeObjects(keys);

  await recordAuditEvent({
    eventType: 'account.deleted',
    ownerId,
    portfolioId: null,
    metadata: {
      portfolios: slugs.length,
      ...objects,
      deletedAt: now.toISOString(),
    },
  });

  const deleted = await hardDeleteUser(ownerId);

  if (!deleted) {
    return { ok: false, failure: DELETION_FAILURES.notFound };
  }

  for (const slug of slugs) {
    invalidateTagImmediately(portfolioCacheTag(slug));
  }

  return {
    ok: true,
    summary: { portfolios: slugs.length, uploads: keys.length, ...objects },
  };
}

/**
 * Best-effort object removal.
 *
 * One failed key does not abort the sweep. A bucket that is briefly unreachable
 * must not be able to prevent someone from deleting their account, and the
 * count of what could not be removed is recorded rather than swallowed so a
 * retention job — or a person — can finish the work.
 */
export async function purgeObjects(
  keys: readonly string[],
): Promise<Pick<DeletionSummary, 'objectsDeleted' | 'objectsFailed'>> {
  const storage = getObjectStorage();
  let objectsDeleted = 0;
  let objectsFailed = 0;

  for (const key of keys) {
    try {
      await storage.delete(key);
      objectsDeleted += 1;
    } catch (error) {
      objectsFailed += 1;
      logger.error('account.deletion.object_failed', { key, error: String(error) });
    }
  }

  return { objectsDeleted, objectsFailed };
}
