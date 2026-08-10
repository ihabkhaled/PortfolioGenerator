import { NextResponse, type NextRequest } from 'next/server';

import {
  buildLocaleRewrite,
  getLocaleDirection,
  isPublicPortfolioCandidatePath,
  resolveLocalePath,
} from '@/modules/localization';
import { findVisiblePage } from '@/modules/portfolio-document';
import { getPublishedPortfolioForLocale } from '@/modules/portfolios/server';
import { resolveRuntimeLocale, SAVED_LOCALE_COOKIE } from '@/modules/preferences';
import { PRIVATE_PAGE_RESPONSE_HEADERS } from '@/modules/private-page-access';
import { isDevelopmentEnvironment } from '@/packages/env';

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
): string {
  const scriptSrc = isDevelopment
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://pagead2.googlesyndication.com`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' https://pagead2.googlesyndication.com`;

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.adtrafficquality.google`,
    `font-src 'self'`,
    `worker-src 'self'`,
    // *.adtrafficquality.google is Google's ad-traffic-quality beacon,
    // called by the AdSense script we already allowlist above — the specific
    // `ep1`/`ep2`/... host it uses is Google's implementation detail to
    // change, not ours to enumerate. Without it Google cannot verify
    // impressions as non-fraudulent, which risks the AdSense account rather
    // than a visitor's data.
    `connect-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.adtrafficquality.google`,
    `frame-src https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.adtrafficquality.google`,
    `media-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

export function buildLocaleRewriteUrl(requestUrl: string | URL, pathname: string): URL {
  const rewritten = new URL(requestUrl.toString());
  rewritten.pathname = pathname;
  return rewritten;
}

async function applyPrivatePageResponseHeaders(
  response: NextResponse,
  pathname: string,
  locale: string,
): Promise<void> {
  if (!isPublicPortfolioCandidatePath(pathname)) return;
  const segments = resolveLocalePath(pathname).pathname.split('/').filter(Boolean);
  const [portfolioSlug, pageSlug] = segments;
  if (!portfolioSlug || !pageSlug || segments.length !== 2) return;
  const portfolio = await getPublishedPortfolioForLocale(portfolioSlug, locale);
  const page = portfolio === null ? null : findVisiblePage(portfolio.document, pageSlug);
  if (page?.page.visibility !== 'private') return;
  for (const [name, value] of Object.entries(PRIVATE_PAGE_RESPONSE_HEADERS)) {
    response.headers.set(name, value);
  }
}

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', contentSecurityPolicy);
  const resolvedPath = resolveLocalePath(request.nextUrl.pathname);
  const locale = resolveRuntimeLocale(
    resolvedPath.explicit ? resolvedPath.locale : null,
    request.cookies.get(SAVED_LOCALE_COOKIE)?.value ?? null,
  );
  requestHeaders.set('x-app-locale', locale);
  requestHeaders.set('x-app-direction', getLocaleDirection(locale));

  const localeRewrite = buildLocaleRewrite(request.nextUrl.pathname);
  const response = localeRewrite
    ? NextResponse.rewrite(buildLocaleRewriteUrl(request.nextUrl, localeRewrite.pathname), {
        request: { headers: requestHeaders },
      })
    : NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set('content-security-policy', contentSecurityPolicy);
  response.headers.set('content-language', locale);

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
