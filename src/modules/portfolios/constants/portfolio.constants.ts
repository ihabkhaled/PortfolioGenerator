import type { PortfolioFormState } from '../types/portfolio-form.types';

/**
 * One portfolio is the product today; the schema supports more, and the limit
 * exists so "more" cannot become "unbounded rows per account" before anyone
 * decides what the product should charge for.
 */
export const PORTFOLIO_MAX_PER_OWNER = 5;

export const PORTFOLIO_INITIAL_FORM_STATE: PortfolioFormState = { status: 'idle', error: null };

export const PORTFOLIO_ACTION_ERRORS = {
  invalidInput: 'errors.invalidInput',
  limitReached: 'errors.limitReached',
  slugTaken: 'errors.slugTaken',
  notFound: 'errors.notFound',
  versionConflict: 'errors.versionConflict',
} as const;
