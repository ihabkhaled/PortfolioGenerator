'use server';

import { requireOwner } from '@/modules/auth/server';
import { validateSlug, suggestSlug } from '@/modules/publishing';
import { toAppRoute } from '@/packages/link';
import { logger } from '@/packages/logger';
import { appRedirect } from '@/packages/navigation';
import { parseSchema } from '@/packages/zod';
import { buildDashboardEditorPath } from '@/shared/constants/route-paths.constants';

import { PORTFOLIO_ACTION_ERRORS, PORTFOLIO_MAX_PER_OWNER } from '../constants/portfolio.constants';
import {
  createPortfolio,
  listOwnedPortfolios,
  isSlugAvailable,
} from '../repositories/portfolio.repository';
import { portfolioCreationSchema } from '../schemas/portfolio.schema';
import type { PortfolioFormState } from '../types/portfolio-form.types';

/**
 * Create a portfolio.
 *
 * Authorization is resolved first and nothing downstream sees anything but the
 * owner id. The slug is validated by the same policy the publish transaction
 * uses, so a portfolio can never be created at an address it could not later
 * be published at.
 */
export async function createPortfolioAction(
  _previous: PortfolioFormState,
  formData: FormData,
): Promise<PortfolioFormState> {
  const owner = await requireOwner();

  const parsed = parseSchema(portfolioCreationSchema, {
    displayName: formData.get('displayName'),
    slug: formData.get('slug'),
  });

  if (!parsed.ok) {
    return { status: 'error', error: PORTFOLIO_ACTION_ERRORS.invalidInput };
  }

  const existing = await listOwnedPortfolios(owner.id);

  if (existing.length >= PORTFOLIO_MAX_PER_OWNER) {
    return { status: 'error', error: PORTFOLIO_ACTION_ERRORS.limitReached };
  }

  const requestedSlug =
    parsed.value.slug.trim() === '' ? suggestSlug(parsed.value.displayName) : parsed.value.slug;
  const validation = validateSlug(requestedSlug);

  if (!validation.ok) {
    return { status: 'error', error: `slug.${validation.reason}` };
  }

  // Advisory only. The unique constraint below is what actually decides a race.
  const isAvailable = await isSlugAvailable(validation.slug, '');

  if (!isAvailable) {
    return { status: 'error', error: PORTFOLIO_ACTION_ERRORS.slugTaken };
  }

  let created;

  try {
    created = await createPortfolio({
      ownerId: owner.id,
      slug: validation.slug,
      displayName: parsed.value.displayName,
    });
  } catch {
    logger.info('portfolio.create.slug_race_lost');

    return { status: 'error', error: PORTFOLIO_ACTION_ERRORS.slugTaken };
  }

  logger.info('portfolio.created', { portfolioId: created.id });

  appRedirect(toAppRoute(buildDashboardEditorPath(created.id)));
}
