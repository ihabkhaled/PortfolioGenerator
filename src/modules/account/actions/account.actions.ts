'use server';

import { headers } from 'next/headers';

import { requireOwner, signOutCurrentSession } from '@/modules/auth/server';
import { logger } from '@/packages/logger';
import { appRedirect } from '@/packages/navigation';
import { parseSchema } from '@/packages/zod';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { ACCOUNT_ERROR_KEYS } from '../constants/deletion.constants';
import { accountDeletionSchema, portfolioDeletionSchema } from '../schemas/account.schema';
import { deleteAccount, deletePortfolio } from '../services/deletion.service';
import type { AccountActionState } from '../types/deletion.types';

/**
 * Deletion, as server actions.
 *
 * Both resolve the owner first and pass only an owner id downstream — a server
 * action is a public endpoint, and "the page already checked" is not a check.
 */

export async function deletePortfolioAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(portfolioDeletionSchema, { portfolioId: formData.get('portfolioId') });

  if (!parsed.ok) {
    return { status: 'error', error: ACCOUNT_ERROR_KEYS.notFound };
  }

  const result = await deletePortfolio(owner.id, parsed.value.portfolioId, new Date());

  if (!result.ok) {
    return { status: 'error', error: ACCOUNT_ERROR_KEYS.notFound };
  }

  logger.info('account.portfolio_deleted', {
    objectsFailed: result.summary.objectsFailed,
    uploads: result.summary.uploads,
  });

  appRedirect(ROUTE_PATHS.dashboard);
}

/**
 * Delete the account, then end the session and land on the marketing page.
 *
 * The sign-out is not cosmetic: the session row is gone with the user, so the
 * cookie now points at nothing. Clearing it explicitly is what stops the next
 * request from being an authentication error the user cannot act on.
 */
export async function deleteAccountAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(accountDeletionSchema, { confirmation: formData.get('confirmation') });

  if (!parsed.ok) {
    return { status: 'error', error: ACCOUNT_ERROR_KEYS.confirmationMismatch };
  }

  const result = await deleteAccount(owner.id, new Date());

  if (!result.ok) {
    return { status: 'error', error: ACCOUNT_ERROR_KEYS.deleteFailed };
  }

  logger.info('account.deleted', {
    portfolios: result.summary.portfolios,
    objectsFailed: result.summary.objectsFailed,
  });

  await signOutCurrentSession(await headers());

  appRedirect(ROUTE_PATHS.home);
}
