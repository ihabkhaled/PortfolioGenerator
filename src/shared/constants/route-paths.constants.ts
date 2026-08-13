/**
 * Every platform route, in one place.
 *
 * Public portfolios live under `/portfolios/{slug}`, kept out of the root
 * namespace on purpose so a portfolio slug can never shadow one of the app's
 * own routes. `RESERVED_SLUG_SEGMENTS` is still derived from these values —
 * not because a collision at the root is possible any more, but because
 * `/portfolios/{platform-word}` stays a phishing-adjacent confusion risk even
 * without a literal 404-shadowing collision — and a unit test asserts the two
 * never drift apart. `PLATFORM_ROUTE_SEGMENTS` (a separate, hand-maintained
 * list in `@/modules/localization`) is what the legacy `/{slug}` → redirect
 * actually keys off; see `src/proxy.ts`.
 */
export const ROUTE_PATHS = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  signOut: '/sign-out',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  dashboardPortfolios: '/dashboard/portfolios',
  dashboardSettings: '/dashboard/settings',
  api: '/api',
  apiContact: '/api/contact',
  apiAssetDeletionRetry: '/api/operations/asset-deletions',
  apiPortfolioPdfDownload: '/api/portfolio-pdf/download',
  managawy: '/managawy',
  managawySignIn: '/managawy/sign-in',
  managawyTwoFactorEnroll: '/managawy/two-factor/enroll',
  managawyUsers: '/managawy/users',
  managawyPortfolios: '/managawy/portfolios',
  managawyAdmins: '/managawy/admins',
  managawyRbac: '/managawy/rbac',
  managawyAuditLog: '/managawy/audit-log',
  managawyAccount: '/managawy/account',
  media: '/media',
  portfolios: '/portfolios',
  robots: '/robots.txt',
  sitemap: '/sitemap.xml',
  feed: '/feed.xml',
  ads: '/ads.txt',
  manifest: '/manifest.webmanifest',
  offline: '/offline',
} as const;

export const MARKETING_ROUTE_PATHS = {
  features: '/guides/features',
  'how-it-works': '/guides/how-it-works',
  examples: '/guides/examples',
  templates: '/guides/templates',
  'cv-import': '/guides/cv-import',
  'ai-accuracy': '/guides/ai-accuracy',
  security: '/guides/security',
  privacy: '/guides/privacy',
  about: '/guides/about',
  mission: '/guides/mission',
  contact: '/guides/contact',
  help: '/guides/help',
  faq: '/guides/faq',
  accessibility: '/guides/accessibility',
  terms: '/guides/terms',
  changelog: '/guides/changelog',
} as const;

export type MarketingRouteSlug = keyof typeof MARKETING_ROUTE_PATHS;

export function buildDashboardPortfolioPath(portfolioId: string): string {
  return `${ROUTE_PATHS.dashboardPortfolios}/${portfolioId}`;
}

export function buildDashboardEditorPath(portfolioId: string): string {
  return `${buildDashboardPortfolioPath(portfolioId)}/editor`;
}

export function buildDashboardImportPath(portfolioId: string): string {
  return `${buildDashboardPortfolioPath(portfolioId)}/import`;
}

export function buildDashboardPreviewPath(portfolioId: string): string {
  return `${buildDashboardPortfolioPath(portfolioId)}/preview`;
}

export function buildDashboardPublishPath(portfolioId: string): string {
  return `${buildDashboardPortfolioPath(portfolioId)}/publish`;
}

/**
 * Where the editor's own live preview reads a not-yet-published asset from.
 *
 * `/media/{assetId}` only ever serves bytes that are part of a *published*
 * snapshot (see `getPublishedAssetBytesUnscoped`), so a portrait or gallery
 * photo uploaded to a draft — before the first publish, or after any edit —
 * has nowhere to be read from until the next Publish. This route is scoped by
 * session ownership instead of publish state, so the preview shows what was
 * actually uploaded rather than a broken image icon.
 */
export function buildDashboardAssetPath(portfolioId: string, assetId: string): string {
  return `${buildDashboardPortfolioPath(portfolioId)}/media/${assetId}`;
}

/**
 * Paths the app serves under `/{portfolioSlug}/` that are not tenant pages.
 *
 * The public route is an optional catch-all, so a page whose slug matched one
 * of these would be shadowed by the platform's own handler and 404 with no
 * explanation. Listed here so the document schema can refuse the slug at the
 * point it is created, rather than leaving the user to discover it after
 * publishing.
 */
export const PORTFOLIO_SUBPATH_SEGMENTS: readonly string[] = [
  'apple-icon',
  'icon',
  'opengraph-image',
  'twitter-image',
];

export function buildPortfolioPath(slug: string): string {
  return `${ROUTE_PATHS.portfolios}/${slug}`;
}

export function buildPortfolioOgImagePath(slug: string): string {
  return `${buildPortfolioPath(slug)}/opengraph-image`;
}

export function buildPublicAssetPath(assetId: string): string {
  return `${ROUTE_PATHS.media}/${assetId}`;
}

/** The token, never the portfolio id or slug — see `portfolio-pdf`'s download route. */
export function buildPortfolioPdfDownloadPath(token: string): string {
  return `${ROUTE_PATHS.apiPortfolioPdfDownload}/${token}`;
}

export function buildPrivatePageAssetPath(
  portfolioSlug: string,
  pageSlug: string,
  assetId: string,
): string {
  return `${buildPortfolioPath(portfolioSlug)}/${pageSlug}/media/${assetId}`;
}
