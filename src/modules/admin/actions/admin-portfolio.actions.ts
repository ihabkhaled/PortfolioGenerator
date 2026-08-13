'use server';

import { deletePortfolio } from '@/modules/account/server';
import {
  invalidatePortfolioPublicCache,
  setPortfolioSuspension,
} from '@/modules/portfolios/server';
import { invalidatePath } from '@/packages/cache';
import { parseSchema } from '@/packages/zod';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import {
  ADMIN_PORTFOLIO_ERROR_KEYS,
  ADMIN_PORTFOLIO_FIELD_NAMES,
} from '../constants/admin-portfolio.constants';
import { getAdminPortfolioOwnerId } from '../repositories/admin-portfolio.repository';
import {
  adminPortfolioDeletionSchema,
  adminPortfolioSuspensionSchema,
} from '../schemas/admin-portfolio.schema';
import { recordAdminAuditEvent } from '../services/admin-audit.service';
import { requireAdmin } from '../services/admin-session.service';
import type { AdminPortfolioActionState } from '../types/admin-portfolio.types';

/**
 * Suspend or reactivate one portfolio.
 *
 * One action rather than two: both directions share the permission, the
 * audit shape and the cache-invalidation step, and a shared `suspend` field
 * is what lets a single container render either button without duplicating
 * the request plumbing.
 */
export async function setAdminPortfolioSuspensionAction(
  _previous: AdminPortfolioActionState,
  formData: FormData,
): Promise<AdminPortfolioActionState> {
  const admin = await requireAdmin('PORTFOLIOS_SUSPEND');
  const parsed = parseSchema(adminPortfolioSuspensionSchema, {
    portfolioId: formData.get(ADMIN_PORTFOLIO_FIELD_NAMES.portfolioId),
    suspend: formData.get(ADMIN_PORTFOLIO_FIELD_NAMES.suspend),
  });

  if (!parsed.ok) {
    return { status: 'error', error: ADMIN_PORTFOLIO_ERROR_KEYS.notFound };
  }

  const outcome = await setPortfolioSuspension(
    parsed.value.portfolioId,
    parsed.value.suspend ? new Date() : null,
  );

  if (!outcome.ok) {
    return { status: 'error', error: ADMIN_PORTFOLIO_ERROR_KEYS.notFound };
  }

  // Drop the cached public snapshot immediately — a suspended portfolio must
  // stop resolving on the next request, not after the cache TTL.
  invalidatePortfolioPublicCache(outcome.slug);

  await recordAdminAuditEvent({
    adminUserId: admin.id,
    targetType: 'PORTFOLIO',
    targetId: parsed.value.portfolioId,
    action: parsed.value.suspend ? 'admin.portfolio.suspended' : 'admin.portfolio.activated',
    metadata: { slug: outcome.slug },
  });

  invalidatePath(ROUTE_PATHS.managawyPortfolios);

  return { status: 'success', error: null };
}

/**
 * Soft-delete one portfolio, the same way its owner would from their own
 * dashboard: `deletePortfolio` is reused, not mirrored, so uploads, assets
 * and the public cache tag are all handled identically regardless of who
 * initiated the delete.
 *
 * The owner id is resolved here from the portfolio id, never trusted from
 * the request — the client only ever sends the id of the row it is acting on.
 */
export async function deleteAdminPortfolioAction(
  _previous: AdminPortfolioActionState,
  formData: FormData,
): Promise<AdminPortfolioActionState> {
  const admin = await requireAdmin('PORTFOLIOS_DELETE');
  const parsed = parseSchema(adminPortfolioDeletionSchema, {
    portfolioId: formData.get(ADMIN_PORTFOLIO_FIELD_NAMES.portfolioId),
  });

  if (!parsed.ok) {
    return { status: 'error', error: ADMIN_PORTFOLIO_ERROR_KEYS.notFound };
  }

  const ownerId = await getAdminPortfolioOwnerId(parsed.value.portfolioId);

  if (ownerId === null) {
    return { status: 'error', error: ADMIN_PORTFOLIO_ERROR_KEYS.notFound };
  }

  const result = await deletePortfolio(ownerId, parsed.value.portfolioId, new Date());

  if (!result.ok) {
    return { status: 'error', error: ADMIN_PORTFOLIO_ERROR_KEYS.notFound };
  }

  await recordAdminAuditEvent({
    adminUserId: admin.id,
    targetType: 'PORTFOLIO',
    targetId: parsed.value.portfolioId,
    action: 'admin.portfolio.deleted',
    metadata: {
      ownerId,
      uploads: result.summary.uploads,
      objectsDeleted: result.summary.objectsDeleted,
      objectsFailed: result.summary.objectsFailed,
    },
  });

  invalidatePath(ROUTE_PATHS.managawyPortfolios);

  return { status: 'success', error: null };
}
