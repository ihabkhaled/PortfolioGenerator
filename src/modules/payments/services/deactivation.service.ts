import 'server-only';

import { recordAuditEvent } from '@/modules/audit/server';
import {
  listOwnedPortfolios,
  portfolioCacheTag,
  unpublishOwnedPortfolio,
} from '@/modules/portfolios/server';
import { invalidateTagImmediately } from '@/packages/cache';
import { logger } from '@/packages/logger';

import { isEligibleForDeactivation } from '../policies/billing-status.policy';
import {
  findOwnersWithExpiredTrials,
  getOwnerBillingState,
} from '../repositories/billing.repository';
import type { OwnerIdRow } from '../types/payments.types';

/**
 * Unpublishes every currently-published portfolio for one owner whose trial
 * has expired without an active subscription, and reports how many it
 * touched. A dedicated function rather than an inner loop in the sweep below,
 * so its own early-continue reads as ordinary control flow instead of a loop
 * nested inside a loop.
 */
async function deactivateOwnerPortfolios(ownerId: string, now: Date): Promise<number> {
  // Re-check against the row this is about to act on. The sweep's query found
  // a candidate; it is not itself the authorization to unpublish.
  const state = await getOwnerBillingState(ownerId);

  if (state === null || !isEligibleForDeactivation(state, now)) {
    return 0;
  }

  const portfolios = await listOwnedPortfolios(ownerId);
  const published = portfolios.filter((portfolio) => portfolio.status === 'PUBLISHED');
  let deactivated = 0;

  for (const portfolio of published) {
    const result = await unpublishOwnedPortfolio(ownerId, portfolio.id);

    if (!result.ok) {
      continue;
    }

    invalidateTagImmediately(portfolioCacheTag(result.value.slug));

    await recordAuditEvent({
      eventType: 'portfolio.trial_deactivated',
      ownerId,
      portfolioId: portfolio.id,
      metadata: { slug: result.value.slug },
    });

    deactivated += 1;
  }

  return deactivated;
}

/**
 * The trial-expiry sweep: portfolios go offline, nothing is deleted.
 *
 * `unpublishOwnedPortfolio` is the exact function the owner's own "unpublish"
 * control calls — deactivation is not a separate, weaker unpublish, it is the
 * same guarantee (the draft survives, the published snapshot is cleared, the
 * slug stays claimed) applied automatically instead of by a click. An owner
 * who subscribes after being deactivated publishes again from the editor
 * rather than being silently re-published sight-unseen; see ADR-0009 for why
 * that asymmetry is deliberate.
 */
export async function deactivateExpiredTrialPortfolios(now: Date, limit: number): Promise<number> {
  const owners = await findOwnersWithExpiredTrials(now, limit);
  const counts = await Promise.all(
    owners.map((owner: OwnerIdRow) => deactivateOwnerPortfolios(owner.id, now)),
  );
  const deactivated = counts.reduce((total, count) => total + count, 0);

  logger.info('payments.trial_deactivation_swept', { ownersChecked: owners.length, deactivated });

  return deactivated;
}
