import type {
  PortfolioPdfCache,
  PortfolioPdfRenderer,
  PortfolioPdfTokenStore,
} from '../types/portfolio-pdf.types';

/**
 * Process-wide slots for the configured cache, token store and renderer.
 *
 * Exposed as holders, exactly like `rate-limit`'s `RATE_LIMITER_REGISTRY`, so
 * a test can swap in a fake without the service knowing, and so there is one
 * greppable answer to "what is caching a PDF renderer here".
 */
export const PORTFOLIO_PDF_CACHE_REGISTRY: { value: PortfolioPdfCache | null } = { value: null };
export const PORTFOLIO_PDF_TOKEN_STORE_REGISTRY: { value: PortfolioPdfTokenStore | null } = {
  value: null,
};
export const PORTFOLIO_PDF_RENDERER_REGISTRY: { value: PortfolioPdfRenderer | null } = {
  value: null,
};
