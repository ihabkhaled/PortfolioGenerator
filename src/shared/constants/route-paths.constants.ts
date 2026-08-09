/**
 * Every platform route, in one place.
 *
 * Public portfolios live at the root (`/{slug}`), so this table is not just
 * navigation convenience — it is the input to the reserved-slug policy. A new
 * platform route that is added here and nowhere else is still protected,
 * because `RESERVED_SLUG_SEGMENTS` is derived from these values and a unit
 * test asserts the two never drift apart.
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
  media: '/media',
  robots: '/robots.txt',
  sitemap: '/sitemap.xml',
  feed: '/feed.xml',
  ads: '/ads.txt',
  manifest: '/manifest.webmanifest',
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
  return `/${slug}`;
}

export function buildPortfolioOgImagePath(slug: string): string {
  return `/${slug}/opengraph-image`;
}

export function buildPublicAssetPath(assetId: string): string {
  return `${ROUTE_PATHS.media}/${assetId}`;
}
