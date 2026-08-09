import { NextResponse, type NextRequest } from 'next/server';

import { buildLocaleRewrite, getLocaleDirection, resolveLocalePath } from '@/modules/localization';
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
    `img-src 'self' blob: data: https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net`,
    `font-src 'self'`,
    `worker-src 'self'`,
    `connect-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net`,
    `frame-src https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com`,
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

export default function proxy(request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', contentSecurityPolicy);
  const resolvedLocale = resolveLocalePath(request.nextUrl.pathname);
  requestHeaders.set('x-app-locale', resolvedLocale.locale);
  requestHeaders.set('x-app-direction', getLocaleDirection(resolvedLocale.locale));

  const localeRewrite = buildLocaleRewrite(request.nextUrl.pathname);
  const response = localeRewrite
    ? NextResponse.rewrite(buildLocaleRewriteUrl(request.nextUrl, localeRewrite.pathname), {
        request: { headers: requestHeaders },
      })
    : NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set('content-security-policy', contentSecurityPolicy);
  response.headers.set('content-language', resolvedLocale.locale);

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
