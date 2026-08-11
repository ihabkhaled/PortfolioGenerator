import { NextResponse, type NextRequest } from 'next/server';

import { getOptionalUser } from '@/modules/auth/server';
import {
  buildLocaleRewrite,
  getLocaleDirection,
  isPublicPortfolioCandidatePath,
  localizePath,
  resolveLocalePath,
  type ResolvedLocalePath,
} from '@/modules/localization';
import { findVisiblePage } from '@/modules/portfolio-document';
import { getPublishedPortfolioForLocale, hasOwnedPortfolio } from '@/modules/portfolios/server';
import { resolveRuntimeLocale, SAVED_LOCALE_COOKIE } from '@/modules/preferences';
import { PRIVATE_PAGE_RESPONSE_HEADERS } from '@/modules/private-page-access';
import { isDevelopmentEnvironment } from '@/packages/env';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

/** `ROUTE_PATHS.portfolios` without its leading slash — the one place that strips it. */
const PORTFOLIOS_SEGMENT = ROUTE_PATHS.portfolios.slice(1);
const DASHBOARD_EDITOR_PATH = /^\/dashboard\/portfolios\/([^/]+)\/editor\/?$/u;
const PRIVATE_DASHBOARD_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

/**
 * Per-request nonce-based Content-Security-Policy. Next.js reads the CSP from
 * the forwarded request headers and stamps the nonce onto its inline scripts.
 * The remaining security headers are static and live in next.config.ts.
 *
 * `connect-src 'self'` matters more here than on a normal site: it means a
 * prompt-injected or otherwise hostile string that somehow reached the DOM
 * still has nowhere to exfiltrate a visitor's data to.
 */
export function buildContentSecurityPolicy(
  nonce: string,
  isDevelopment = isDevelopmentEnvironment,
  allowsPaypalCheckout = false,
): string {
  const paypalSources = allowsPaypalCheckout
    ? ' https://*.paypal.com https://*.paypalobjects.com https://*.venmo.com'
    : '';
  const scriptSrc = isDevelopment
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://pagead2.googlesyndication.com${paypalSources}`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' https://pagead2.googlesyndication.com${paypalSources}`;

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'${paypalSources}`,
    `img-src 'self' blob: data: https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.adtrafficquality.google${paypalSources}`,
    `font-src 'self'`,
    `worker-src 'self'`,
    // *.adtrafficquality.google is Google's ad-traffic-quality beacon,
    // called by the AdSense script we already allowlist above — the specific
    // `ep1`/`ep2`/... host it uses is Google's implementation detail to
    // change, not ours to enumerate. Without it Google cannot verify
    // impressions as non-fraudulent, which risks the AdSense account rather
    // than a visitor's data.
    `connect-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.adtrafficquality.google${paypalSources}`,
    ...(allowsPaypalCheckout ? [`child-src${paypalSources}`] : []),
    `frame-src https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.adtrafficquality.google${paypalSources}`,
    `media-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

export function resolveCrossOriginOpenerPolicy(
  pathname: string,
): 'same-origin' | 'same-origin-allow-popups' {
  return resolveLocalePath(pathname).pathname === ROUTE_PATHS.dashboardSettings
    ? 'same-origin-allow-popups'
    : 'same-origin';
}

export function buildLocaleRewriteUrl(requestUrl: string | URL, pathname: string): URL {
  const rewritten = new URL(requestUrl.toString());
  rewritten.pathname = pathname;
  return rewritten;
}

export function resolveDashboardEditorPortfolioId(pathname: string): string | null {
  return DASHBOARD_EDITOR_PATH.exec(resolveLocalePath(pathname).pathname)?.[1] ?? null;
}

async function buildDashboardEditorNotFoundResponse(
  request: NextRequest,
  requestHeaders: Headers,
): Promise<NextResponse | null> {
  const portfolioId = resolveDashboardEditorPortfolioId(request.nextUrl.pathname);
  if (portfolioId === null) return null;

  const user = await getOptionalUser(request.headers);
  if (user === null || (await hasOwnedPortfolio(user.id, portfolioId))) return null;

  const target = new URL('/__portfolio-not-found', request.url);
  return NextResponse.rewrite(target, { status: 404, request: { headers: requestHeaders } });
}

async function applyPrivatePageResponseHeaders(
  response: NextResponse,
  pathname: string,
  locale: string,
): Promise<void> {
  // Not `isPublicPortfolioCandidatePath` here: 'portfolios' is now a platform
  // segment (see locale.constants.ts), so that check correctly says a
  // `/portfolios/...` request is *not* a bare-slug candidate — which is
  // exactly backwards for this function, whose job only starts once a
  // request has already resolved to the real portfolio route.
  const segments = resolveLocalePath(pathname).pathname.split('/').filter(Boolean);
  const [first, portfolioSlug, pageSlug] = segments;
  if (first !== PORTFOLIOS_SEGMENT || !portfolioSlug || !pageSlug || segments.length !== 3) return;
  const portfolio = await getPublishedPortfolioForLocale(portfolioSlug, locale);
  const page = portfolio === null ? null : findVisiblePage(portfolio.document, pageSlug);
  if (page?.page.visibility !== 'private') return;
  for (const [name, value] of Object.entries(PRIVATE_PAGE_RESPONSE_HEADERS)) {
    response.headers.set(name, value);
  }
}

/**
 * A published portfolio's old `/{slug}` address — already indexed, already
 * bookmarked — has to keep working after the move to `/portfolios/{slug}`.
 * 308, not a softer code: this is "permanently lives elsewhere," and search
 * engines and browsers should update their own records rather than keep
 * asking.
 *
 * Only ever redirects a slug that resolves to a real, published portfolio.
 * Everything else — a scanner probe, a stale slug from a deleted or
 * unpublished portfolio, a path that was never a portfolio at all — returns
 * `null` and falls through to whatever would have happened today: a direct
 * 404 with no redirect hop, so a guess is never told it landed closer to a
 * real slug than another guess would have.
 */
async function buildLegacyPortfolioRedirect(
  request: NextRequest,
  resolvedPath: ResolvedLocalePath,
  locale: string,
): Promise<NextResponse | null> {
  const segments = resolvedPath.pathname.split('/').filter(Boolean);
  const [slug, ...rest] = segments;

  // No first segment (root `/`) or already the new shape: nothing to redirect.
  // The `PORTFOLIOS_SEGMENT` check is redundant with `isPublicPortfolioCandidatePath`
  // below now that 'portfolios' is a platform segment — kept anyway as the
  // cheap short-circuit for the hot path, since real portfolio traffic hits
  // this function on every request.
  if (slug === undefined || slug === PORTFOLIOS_SEGMENT) return null;
  if (!isPublicPortfolioCandidatePath(request.nextUrl.pathname)) return null;

  const portfolio = await getPublishedPortfolioForLocale(slug, locale);
  if (portfolio === null) return null;

  const canonicalTarget = [ROUTE_PATHS.portfolios, slug, ...rest].join('/');
  const localizedTarget = resolvedPath.explicit
    ? localizePath(canonicalTarget, resolvedPath.locale)
    : canonicalTarget;

  const target = new URL(localizedTarget, request.url);
  target.search = request.nextUrl.search;

  return NextResponse.redirect(target, 308);
}

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const resolvedPath = resolveLocalePath(request.nextUrl.pathname);
  const contentSecurityPolicy = buildContentSecurityPolicy(
    nonce,
    isDevelopmentEnvironment,
    resolvedPath.pathname === ROUTE_PATHS.dashboardSettings,
  );

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', contentSecurityPolicy);
  const locale = resolveRuntimeLocale(
    resolvedPath.explicit ? resolvedPath.locale : null,
    request.cookies.get(SAVED_LOCALE_COOKIE)?.value ?? null,
  );
  requestHeaders.set('x-app-locale', locale);
  requestHeaders.set('x-app-direction', getLocaleDirection(locale));

  const dashboardNotFound = await buildDashboardEditorNotFoundResponse(request, requestHeaders);
  if (dashboardNotFound) {
    dashboardNotFound.headers.set('content-security-policy', contentSecurityPolicy);
    dashboardNotFound.headers.set('content-language', locale);
    for (const [name, value] of Object.entries(PRIVATE_DASHBOARD_HEADERS)) {
      dashboardNotFound.headers.set(name, value);
    }
    return dashboardNotFound;
  }

  const legacyRedirect = await buildLegacyPortfolioRedirect(request, resolvedPath, locale);

  if (legacyRedirect) {
    legacyRedirect.headers.set('content-security-policy', contentSecurityPolicy);
    legacyRedirect.headers.set('content-language', locale);
    return legacyRedirect;
  }

  const localeRewrite = buildLocaleRewrite(request.nextUrl.pathname);
  const response = localeRewrite
    ? NextResponse.rewrite(buildLocaleRewriteUrl(request.nextUrl, localeRewrite.pathname), {
        request: { headers: requestHeaders },
      })
    : NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set('content-security-policy', contentSecurityPolicy);
  response.headers.set('content-language', locale);
  response.headers.set(
    'cross-origin-opener-policy',
    resolveCrossOriginOpenerPolicy(request.nextUrl.pathname),
  );

  await applyPrivatePageResponseHeaders(response, request.nextUrl.pathname, locale);

  return response;
}

export const config = {
  matcher: [
    {
      /*
      Static assets and prefetches keep default headers.
      */
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
