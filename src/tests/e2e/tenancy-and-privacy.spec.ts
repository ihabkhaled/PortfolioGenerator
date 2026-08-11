import { expect, test } from '@playwright/test';

import { buildFullPortfolioDocument } from '../fixtures/portfolio-document.fixtures';

import {
  buildAccount,
  createPortfolio,
  openEditorDisclosure,
  openEditorPageEntries,
  publishPortfolio,
  saveEditor,
  signUp,
} from './support/accounts';
import { buildResumePdf } from './support/pdf.fixture';

function portfolioIdFromEditorUrl(url: string): string {
  const portfolioId = /portfolios\/([^/]+)\/editor/u.exec(url)?.[1];
  if (portfolioId === undefined) throw new Error('Expected an owner portfolio id');
  return portfolioId;
}

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

    await expect(page).toHaveURL(/\/sign-in/u);
    expect(response?.status()).toBeLessThan(400);
  });

  for (const path of ['/dashboard/settings', '/dashboard/portfolios/anything/editor']) {
    test(`redirects ${path} to sign in rather than answering`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/sign-in/u);
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

  // A bookmarked or indexed pre-move address has to keep resolving, but only
  // for as long as the portfolio behind it is actually public — otherwise the
  // redirect itself becomes a way to learn a slug used to be live.
  test('a published portfolio’s legacy address redirects permanently; an unpublished one just 404s', async ({
    page,
  }) => {
    const account = buildAccount('legacy-redirect');

    await signUp(page, account);
    const slug = await publishPortfolio(page, 'Legacy Address Owner');

    const redirected = await page.request.get(`/${slug}`, { maxRedirects: 0 });

    expect(redirected.status()).toBe(308);
    expect(redirected.headers()['location']).toContain(`/portfolios/${slug}`);

    await page.getByRole('button', { name: 'Unpublish' }).click();
    await page.getByRole('button', { name: 'Publish', exact: true }).waitFor();

    const afterUnpublish = await page.request.get(`/${slug}`, { maxRedirects: 0 });

    expect(afterUnpublish.status()).toBe(404);
    expect(afterUnpublish.headers()['location']).toBeUndefined();
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
  test('rejects tampered page access, asset upload and deletion forms', async ({
    page,
    browser,
  }) => {
    const owner = buildAccount('tamper-owner');
    await signUp(page, owner);
    await createPortfolio(page, 'Tamper Owner Portfolio');
    const ownerEditorUrl = page.url();
    const ownerPortfolioId = portfolioIdFromEditorUrl(ownerEditorUrl);
    const foreignDocument = {
      ...buildFullPortfolioDocument(),
      identity: { ...buildFullPortfolioDocument().identity, headline: 'Foreign mutation' },
    };
    await openEditorDisclosure(page, 'Pages');
    await page.locator('#new-page-title').fill('Owner notes');
    await page.locator('#new-page-nav').fill('Notes');
    await page.locator('#new-page-slug').fill('notes');
    await page.getByRole('button', { name: 'Add page' }).click();
    await saveEditor(page);
    await expect(page.getByText('Saved').first()).toBeVisible();
    await openEditorPageEntries(page);
    const ownerAccessForm = page.locator('form').filter({
      has: page.getByRole('button', { name: 'Update page access' }),
    });
    const ownerPageId = await ownerAccessForm.locator('input[name="pageId"]').inputValue();
    const ownerVersion = await ownerAccessForm
      .locator('input[name="expectedVersion"]')
      .inputValue();

    const strangerContext = await browser.newContext();
    const strangerPage = await strangerContext.newPage();
    const stranger = buildAccount('tamper-stranger');
    await signUp(strangerPage, stranger);
    await createPortfolio(strangerPage, 'Tamper Stranger Portfolio');
    const foreignSave = await strangerPage.request.post('/api/test/editor-save', {
      data: { portfolioId: ownerPortfolioId, expectedVersion: 1, document: foreignDocument },
    });
    expect(foreignSave.status()).toBe(404);
    expect(await foreignSave.json()).toEqual({ error: 'rejected' });
    await openEditorDisclosure(strangerPage, 'Pages');
    await strangerPage.locator('#new-page-title').fill('Stranger notes');
    await strangerPage.locator('#new-page-nav').fill('Notes');
    await strangerPage.locator('#new-page-slug').fill('notes');
    await strangerPage.getByRole('button', { name: 'Add page' }).click();
    await saveEditor(strangerPage);
    await openEditorPageEntries(strangerPage);

    const strangerAccessForm = strangerPage.locator('form').filter({
      has: strangerPage.getByRole('button', { name: 'Update page access' }),
    });
    await strangerAccessForm.locator('input[name="portfolioId"]').evaluate((input, value) => {
      (input as HTMLInputElement).value = value;
    }, ownerPortfolioId);
    await strangerAccessForm.locator('input[name="pageId"]').evaluate((input, value) => {
      (input as HTMLInputElement).value = value;
    }, ownerPageId);
    await strangerAccessForm.locator('input[name="expectedVersion"]').evaluate((input, value) => {
      (input as HTMLInputElement).value = value;
    }, ownerVersion);
    await strangerAccessForm.getByLabel('Page access').selectOption('private');
    await strangerAccessForm.getByLabel('Share password').fill('attempted owner password');
    await strangerAccessForm.getByRole('button', { name: 'Update page access' }).click();
    await expect(strangerAccessForm.getByRole('alert')).toContainText(
      'This portfolio or page is no longer available.',
    );

    await openEditorDisclosure(strangerPage, 'Photos and downloads');
    const uploadForm = strangerPage.locator('form').filter({
      has: strangerPage.getByRole('button', { name: 'Upload attachment' }),
    });
    await uploadForm.getByLabel('Downloadable file').setInputFiles({
      name: 'tampered.pdf',
      mimeType: 'application/pdf',
      buffer: buildResumePdf(['Cross-tenant upload attempt']),
    });
    await strangerPage.getByLabel('Public download label').fill('Tampered upload');
    await uploadForm.locator('input[name="portfolioId"]').evaluate((input, value) => {
      (input as HTMLInputElement).value = value;
    }, ownerPortfolioId);
    await uploadForm.getByRole('button', { name: 'Upload attachment' }).click();
    await expect(uploadForm.getByRole('alert')).toContainText(
      'That portfolio is no longer available.',
    );

    await strangerPage.goto('/dashboard');
    const strangerRow = strangerPage.locator('li').filter({
      hasText: 'Tamper Stranger Portfolio',
    });
    await strangerRow.getByRole('button', { name: 'Delete', exact: true }).click();
    const deletionForm = strangerRow.locator('form');
    await deletionForm.locator('input[name="portfolioId"]').evaluate((input, value) => {
      (input as HTMLInputElement).value = value;
    }, ownerPortfolioId);
    await deletionForm.getByRole('button', { name: 'Delete permanently' }).click();
    await expect(strangerPage).toHaveURL(/\/dashboard$/u);

    await page.goto(ownerEditorUrl);
    await expect(page.getByLabel('Headline')).toHaveValue('');
    await openEditorDisclosure(page, 'Pages');
    await openEditorPageEntries(page);
    await expect(page.getByLabel('Page access')).toHaveValue('public');
    await expect(page.getByText('Tampered upload')).toHaveCount(0);
    await page.goto('/dashboard');
    await expect(page.getByText('Tamper Owner Portfolio')).toBeVisible();
    await strangerContext.close();
  });

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
