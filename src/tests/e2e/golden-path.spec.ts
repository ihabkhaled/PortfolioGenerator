import { expect, test } from '@playwright/test';

import {
  buildAccount,
  claimAddress,
  createPortfolio,
  openImport,
  requireBrowser,
  signUp,
} from './support/accounts';
import { buildResumePdf, RESUME_LINES } from './support/pdf.fixture';

/**
 * The whole product, once, as a person experiences it.
 *
 * Sign up, create a portfolio, upload a CV, see what the extractor found,
 * correct it, claim an address, publish, and open the public URL as a stranger
 * would. Every step here is one a real user cannot skip, which is the bar for
 * being in this file — the adversarial cases live in their own spec.
 */
test.describe('the golden path', () => {
  test('a CV becomes a published portfolio', async ({ page, context }) => {
    const account = buildAccount('golden');
    const slug = `noor-haddad-${Date.now()}`;

    await signUp(page, account);
    await createPortfolio(page, 'Noor Haddad');

    await expect(page.getByLabel('Display name')).toHaveValue('Noor Haddad');

    // --- Import -------------------------------------------------------------
    await openImport(page);

    await page.getByLabel('CV file').setInputFiles({
      name: 'noor-haddad-cv.pdf',
      mimeType: 'application/pdf',
      buffer: buildResumePdf(RESUME_LINES),
    });

    await page.getByRole('button', { name: 'Import' }).click();

    // The import lands on a review screen, never on a published page: an
    // extraction is a draft proposal until a person has looked at it.
    await page.waitForURL('**/editor', { timeout: 60_000 });

    await expect(page.getByLabel('Display name')).toHaveValue('Noor Haddad');
    await expect(page.getByLabel('Email')).toHaveValue('noor.haddad@example.com');

    // --- Review -------------------------------------------------------------
    await page.getByLabel('Headline').fill('Platform engineer, scheduling and reliability');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByText('Saved').first()).toBeVisible();

    // --- Publish ------------------------------------------------------------
    await claimAddress(page, slug);

    await expect(page.getByLabel('Public address')).toHaveValue(slug);

    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await page.getByRole('button', { name: 'Unpublish' }).waitFor();

    // --- Read it as a stranger ---------------------------------------------
    const visitor = await requireBrowser(context).newContext();
    const publicPage = await visitor.newPage();
    const response = await publicPage.goto(`/${slug}`);

    expect(response?.status()).toBe(200);
    await expect(publicPage.getByRole('heading', { level: 1 })).toHaveText('Noor Haddad');
    await expect(
      publicPage.getByText('Platform engineer, scheduling and reliability').first(),
    ).toBeVisible();
    await expect(publicPage.getByText('Meridian Logistics')).toBeVisible();

    // The extractor's output reached the page as content, and the reviewed
    // headline is the one that is public.
    await expect(publicPage.getByText('Cedar Systems')).toBeVisible();

    await visitor.close();
  });
});
