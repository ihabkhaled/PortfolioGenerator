import { DEFAULT_LOCALE, localizePath } from '@/modules/localization';
import { buildPageHref, findVisiblePage } from '@/modules/portfolio-document';
import { getPublishedPortfolio } from '@/modules/portfolios/server';
import {
  buildPrivatePageCookie,
  buildPrivatePageHeaders,
  parsePrivatePageUnlockSubmission,
  unlockPrivatePage,
} from '@/modules/private-page-access';
import { consumePrivatePageUnlockQuota } from '@/modules/private-page-access/server';
import { getServerEnv } from '@/packages/env/server';
import { getClientAddress } from '@/packages/headers';

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const parsed = parsePrivatePageUnlockSubmission({
    portfolioSlug: form.get('portfolioSlug'),
    pageSlug: form.get('pageSlug'),
    password: form.get('password'),
    locale: form.get('locale'),
  });

  if (!parsed.ok) {
    return new Response(null, { status: 404, headers: buildPrivatePageHeaders() });
  }

  const portfolio = await getPublishedPortfolio(parsed.value.portfolioSlug);
  const resolved =
    portfolio === null ? null : findVisiblePage(portfolio.document, parsed.value.pageSlug);

  if (resolved?.page.visibility !== 'private' || resolved.page.passwordHash === null) {
    return new Response(null, { status: 404, headers: buildPrivatePageHeaders() });
  }

  const scope = {
    portfolioSlug: parsed.value.portfolioSlug,
    pageId: resolved.page.id,
    pageSlug: resolved.page.slug,
    locale: parsed.value.locale,
  };
  const address = await getClientAddress();
  const attemptAllowed = await consumePrivatePageUnlockQuota(address, scope, new Date());
  const env = getServerEnv();
  const grant = attemptAllowed
    ? await unlockPrivatePage({
        password: parsed.value.password,
        passwordHash: resolved.page.passwordHash,
        scope,
        secret: env.BETTER_AUTH_SECRET,
      })
    : null;
  const pageHref = buildPageHref(scope.portfolioSlug, scope.pageSlug);
  const target = new URL(
    scope.locale === DEFAULT_LOCALE ? pageHref : localizePath(pageHref, scope.locale),
    request.url,
  );

  if (grant === null) target.searchParams.set('access', 'denied');

  const headers = new Headers(buildPrivatePageHeaders());

  if (grant !== null) {
    headers.set(
      'Set-Cookie',
      buildPrivatePageCookie({
        grant,
        scope,
        secure: env.NEXT_PUBLIC_APP_ENV !== 'local',
      }),
    );
  }

  if (request.headers.get('accept')?.includes('application/json')) {
    headers.set('Content-Type', 'application/json');
    return Response.json(
      { target: `${target.pathname}${target.search}` },
      { status: grant === null ? 401 : 200, headers },
    );
  }

  headers.set('Location', target.href);
  return new Response(null, { status: 303, headers });
}
