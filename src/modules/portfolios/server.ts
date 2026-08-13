import 'server-only';

/**
 * Server-only surface of the portfolios module.
 *
 * Separate from `index.ts` so a client component importing a portfolio *type*
 * does not pull the database client into its bundle.
 */

export { PORTFOLIO_CACHE_KEY_PREFIX } from './constants/portfolio-cache.constants';
export {
  createPortfolio,
  findPublishedByIdUnscoped,
  findPublishedBySlugUnscoped,
  findPublishedTranslationBySlugAndLocaleUnscoped,
  getOwnedPortfolio,
  hasOwnedPortfolio,
  isSlugAvailable,
  listOwnedPortfolios,
  listOwnedSlugs,
  listPublishedPortfoliosUnscoped,
  listPublishedTranslationsUnscoped,
  listPublishedTranslationsBySlugUnscoped,
  publishOwnedPortfolio,
  saveDraftDocument,
  setPortfolioSuspension,
  softDeleteOwnedPortfolio,
  unpublishOwnedPortfolio,
  updateOwnedSlug,
} from './repositories/portfolio.repository';
export {
  getPublishedPortfolio,
  getPublishedPortfolioById,
  getPublishedPortfolioForLocale,
  invalidatePortfolioPublicCache,
  portfolioCacheTag,
} from './services/public-portfolio.service';
export type { PortfolioSuspensionOutcome } from './types/portfolio.types';
