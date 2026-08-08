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
  findPublishedBySlugUnscoped,
  getOwnedPortfolio,
  isSlugAvailable,
  listOwnedPortfolios,
  listOwnedSlugs,
  listPublishedPortfoliosUnscoped,
  publishOwnedPortfolio,
  saveDraftDocument,
  softDeleteOwnedPortfolio,
  unpublishOwnedPortfolio,
  updateOwnedSlug,
} from './repositories/portfolio.repository';
export { getPublishedPortfolio, portfolioCacheTag } from './services/public-portfolio.service';
