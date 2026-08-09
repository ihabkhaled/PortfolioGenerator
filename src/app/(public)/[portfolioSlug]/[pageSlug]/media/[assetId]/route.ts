import type { NextRequest } from 'next/server';

import { getPrivatePageAssetBytesUnscoped } from '@/modules/assets/server';
import { DEFAULT_LOCALE, isAppLocale } from '@/modules/localization';
import { findVisiblePage } from '@/modules/portfolio-document';
import { getPublishedPortfolio } from '@/modules/portfolios/server';
import {
  buildPrivatePageCookieName,
  buildPrivatePageHeaders,
  verifyPrivatePageGrant,
} from '@/modules/private-page-access';
import { getServerEnv } from '@/packages/env/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: {
    readonly params: Promise<{ portfolioSlug: string; pageSlug: string; assetId: string }>;
  },
): Promise<Response> {
  const { portfolioSlug, pageSlug, assetId } = await context.params;
  const requestedLocale = request.headers.get('x-app-locale') ?? DEFAULT_LOCALE;
  const locale = isAppLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const portfolio = await getPublishedPortfolio(portfolioSlug);
  const resolved = portfolio === null ? null : findVisiblePage(portfolio.document, pageSlug);
  if (resolved?.page.visibility !== 'private') {
    return new Response(null, { status: 404, headers: buildPrivatePageHeaders() });
  }
  const scope = { portfolioSlug, pageId: resolved.page.id, pageSlug: resolved.page.slug, locale };
  const grant = request.cookies.get(
    buildPrivatePageCookieName(portfolioSlug, resolved.page.id),
  )?.value;
  if (
    !grant ||
    !verifyPrivatePageGrant({ grant, scope, secret: getServerEnv().BETTER_AUTH_SECRET })
  ) {
    return new Response(null, { status: 404, headers: buildPrivatePageHeaders() });
  }
  const found = await getPrivatePageAssetBytesUnscoped(assetId, portfolioSlug, pageSlug);
  if (found === null)
    return new Response(null, { status: 404, headers: buildPrivatePageHeaders() });
  const headers = new Headers(buildPrivatePageHeaders());
  headers.set('Content-Type', found.asset.contentType);
  headers.set('Content-Length', String(found.bytes.length));
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(Buffer.from(found.bytes), { headers });
}
