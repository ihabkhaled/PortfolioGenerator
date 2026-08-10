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
 *
 * Anchored on `globalThis`, the same reason `packages/database`'s Prisma
 * client is: Next.js gives the page that mints a download token and the API
 * route that resolves it separate module instances (a hot reload in dev, or
 * simply two different route bundles), so a plain module-scope object is not
 * actually one registry — it is a different empty one on each side of the
 * request pair. The in-memory token store's forward and reverse maps have to
 * be the same instance from both ends, or a token that was just minted can
 * never resolve.
 */
const globalForPortfolioPdf = globalThis as unknown as {
  portfolioPdfRegistry?: {
    cache: { value: PortfolioPdfCache | null };
    tokenStore: { value: PortfolioPdfTokenStore | null };
    renderer: { value: PortfolioPdfRenderer | null };
  };
};

globalForPortfolioPdf.portfolioPdfRegistry ??= {
  cache: { value: null },
  tokenStore: { value: null },
  renderer: { value: null },
};

export const PORTFOLIO_PDF_CACHE_REGISTRY = globalForPortfolioPdf.portfolioPdfRegistry.cache;
export const PORTFOLIO_PDF_TOKEN_STORE_REGISTRY =
  globalForPortfolioPdf.portfolioPdfRegistry.tokenStore;
export const PORTFOLIO_PDF_RENDERER_REGISTRY =
  globalForPortfolioPdf.portfolioPdfRegistry.renderer;
