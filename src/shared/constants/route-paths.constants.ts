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
  dashboard: '/dashboard',
  dashboardPortfolios: '/dashboard/portfolios',
  dashboardSettings: '/dashboard/settings',
  api: '/api',
  robots: '/robots.txt',
  sitemap: '/sitemap.xml',
  manifest: '/manifest.webmanifest',
} as const;

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

export function buildPortfolioPath(slug: string): string {
  return `/${slug}`;
}
