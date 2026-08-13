import type { MetadataRoute } from 'next';

import { absoluteUrl, publicEnv } from '@/packages/env';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

/**
 * Crawl rules for the whole domain.
 *
 * Published portfolios are the point of the product and are open by default;
 * everything behind a session is disallowed. `robots.txt` is a request, not
 * access control — the dashboard is protected by auth and sends
 * `X-Robots-Tag: noindex` besides — but a crawler that respects this file
 * should not be spending its budget on pages it will be redirected away from.
 * Portfolios live under `/portfolios/`, but that prefix still cannot be
 * blanket-disallowed here: it holds every *public* portfolio too, not only
 * the private ones, and disallowing it would hide all of them from crawlers.
 * Private pages instead rely entirely on their own challenge, content, and
 * grant-scoped media responses sending noindex/nofollow and private, no-store
 * headers — the same guarantee as before the slug namespace moved, just one
 * directory deeper. Adding tenant slugs here would disclose them.
 *
 * Non-production deployments disallow everything. A preview URL indexed
 * alongside production splits ranking between two copies of the same portfolio
 * and can leave a tenant's page ranking on a hostname that will be recycled.
 */
export default function robots(): MetadataRoute.Robots {
  if (publicEnv.NEXT_PUBLIC_APP_ENV !== 'production') {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          `${ROUTE_PATHS.dashboard}/`,
          ROUTE_PATHS.dashboard,
          `${ROUTE_PATHS.managawy}/`,
          ROUTE_PATHS.managawy,
          `${ROUTE_PATHS.api}/`,
          ROUTE_PATHS.signOut,
          ROUTE_PATHS.signIn,
          ROUTE_PATHS.signUp,
          ROUTE_PATHS.forgotPassword,
          ROUTE_PATHS.resetPassword,
        ],
      },
    ],
    sitemap: absoluteUrl(ROUTE_PATHS.sitemap),
    host: absoluteUrl('/'),
  };
}
