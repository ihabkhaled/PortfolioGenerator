import { expect, test } from '@playwright/test';

import { buildAccount, createPortfolio, signUp } from './support/accounts';

/**
 * The promises that would be worth the most to break.
 *
 * Each test here is a way someone could reach content that is not theirs, or
 * publish something the owner did not agree to publish. They are separated from
 * the golden path because a failure here is a security incident, not a broken
 * feature, and the distinction should be visible in the run output.
 */

test.describe('what an anonymous visitor can reach', () => {
  test('the dashboard sends an unauthenticated visitor to sign in', async ({ page }) => {
    const response = await page.goto('/dashboard');

    expect(page.url()).toContain('/sign-in');
    expect(response?.status()).toBeLessThan(400);
  });

  for (const path of ['/dashboard/settings', '/dashboard/portfolios/anything/editor']) {
    test(`redirects ${path} to sign in rather than answering`, async ({ page }) => {
      await page.goto(path);

      expect(page.url()).toContain('/sign-in');
    });
  }

  // A draft and a typo must be indistinguishable, or the router becomes a way
  // to enumerate unpublished work.
  test('an unpublished portfolio and an unknown slug both 404', async ({ page }) => {
    const account = buildAccount('draft');

    await signUp(page, account);
    const slug = await createPortfolio(page, 'Draft Only');

    const unknown = await page.request.get('/no-such-portfolio-at-all');
    const draft = await page.request.get(`/${slug}`);

    expect(unknown.status()).toBe(404);
    expect(draft.status()).toBe(404);
  });

  test('the dashboard is never cached and never indexed', async ({ page }) => {
    const account = buildAccount('headers');

    await signUp(page, account);

    // The document response, not an API fetch: this is the one a browser
    // caches and a crawler reads.
    const response = await page.goto('/dashboard');
    const headers = response?.headers() ?? {};

    expect(headers['cache-control']).toContain('no-store');
    expect(headers['x-robots-tag']).toContain('noindex');
  });

  test('every response carries the security headers', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();

    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBeTruthy();
  });
});

test.describe('one tenant cannot reach another', () => {
  test('a portfolio id belonging to someone else is a 404, not a 403', async ({
    page,
    browser,
  }) => {
    const owner = buildAccount('owner');
    const stranger = buildAccount('stranger');

    await signUp(page, owner);
    await createPortfolio(page, 'Owner Portfolio');

    const ownedEditorUrl = page.url();

    const strangerContext = await browser.newContext();
    const strangerPage = await strangerContext.newPage();

    await signUp(strangerPage, stranger);

    const response = await strangerPage.goto(ownedEditorUrl);

    // 404 rather than 403: telling a stranger the id exists is itself a leak.
    expect(response?.status()).toBe(404);

    await strangerContext.close();
  });
});

test.describe('the health probe', () => {
  test('answers without a session and says nothing it should not', async ({ request }) => {
    const response = await request.get('/api/health');
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toContain('no-store');
    expect(Object.keys(body).toSorted((left, right) => left.localeCompare(right))).toEqual([
      'checks',
      'state',
    ]);
    expect(JSON.stringify(body)).not.toMatch(/postgres|password|secret|stack|Error/i);
  });
});

test.describe('crawl rules', () => {
  test('robots.txt disallows the dashboard outside production', async ({ request }) => {
    const response = await request.get('/robots.txt');
    const body = await response.text();

    expect(response.status()).toBe(200);
    // The E2E build runs with NEXT_PUBLIC_APP_ENV unset, so it is not
    // production and must refuse crawling entirely.
    expect(body).toContain('Disallow: /');
  });

  test('the sitemap lists no unpublished work', async ({ page, request }) => {
    const account = buildAccount('sitemap');

    await signUp(page, account);
    const slug = await createPortfolio(page, 'Never Published');

    const response = await request.get('/sitemap.xml');
    const body = await response.text();

    expect(response.status()).toBe(200);
    expect(body).not.toContain(slug);
    expect(body).not.toContain('/dashboard');
  });
});
