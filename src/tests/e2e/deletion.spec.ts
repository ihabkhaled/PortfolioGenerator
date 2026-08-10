import { expect, test } from '@playwright/test';

import {
  buildAccount,
  createPortfolio,
  publishPortfolio,
  signIn,
  signUp,
} from './support/accounts';

/**
 * Deletion, end to end.
 *
 * "We deleted your CV" is a claim the product makes to a person about their own
 * data. These tests are the evidence for it.
 */

test.describe('deleting a portfolio', () => {
  test('needs a second, deliberate confirmation', async ({ page }) => {
    const account = buildAccount('delete-confirm');

    await signUp(page, account);
    await createPortfolio(page, 'Confirm Me');
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Delete', exact: true }).first().click();

    await expect(page.getByRole('button', { name: 'Delete permanently' })).toBeVisible();

    await page.getByRole('button', { name: 'Keep it' }).click();

    // Backing out leaves nothing armed behind it.
    await expect(page.getByRole('button', { name: 'Delete permanently' })).toBeHidden();
    await expect(page.getByText('Confirm Me').first()).toBeVisible();
  });

  test('removes it from the dashboard and stops the public address serving', async ({
    page,
    request,
  }) => {
    const account = buildAccount('delete-portfolio');

    await signUp(page, account);
    const slug = await publishPortfolio(page, 'Deleted Portfolio');

    await expect.poll(async () => (await request.get(`/${slug}`)).status()).toBe(200);

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Delete', exact: true }).first().click();
    await page.getByRole('button', { name: 'Delete permanently' }).click();

    await expect.poll(async () => (await request.get(`/${slug}`)).status()).toBe(404);
    await expect(page.getByText('Deleted Portfolio')).toHaveCount(0);
  });
});

test.describe('deleting an account', () => {
  test('is armed only by typing the confirmation word', async ({ page }) => {
    const account = buildAccount('delete-arm');

    await signUp(page, account);
    await page.goto('/dashboard/settings');

    const submit = page.getByRole('button', { name: 'Delete my account' });

    await expect(submit).toBeDisabled();

    await page.getByLabel(/type/i).fill('delete');
    await expect(submit).toBeDisabled();

    await page.getByLabel(/type/i).fill('DELETE');
    await expect(submit).toBeEnabled();
  });

  test('ends the session and makes the credentials unusable', async ({ page }) => {
    const account = buildAccount('delete-account');

    await signUp(page, account);
    await page.goto('/dashboard/settings');

    await expect(page.getByText(account.email).last()).toBeVisible();

    await page.getByLabel(/type/i).fill('DELETE');
    await page.getByRole('button', { name: 'Delete my account' }).click();

    await page.waitForURL((url) => !url.pathname.startsWith('/dashboard'));

    // The session is gone with the row, so the dashboard is unreachable.
    await page.goto('/dashboard');
    expect(page.url()).toContain('/sign-in');

    // And the account cannot be signed back into.
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill(account.email);
    await page.getByLabel('Password', { exact: true }).fill(account.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    expect(page.url()).toContain('/sign-in');
  });

  test('leaves other accounts untouched', async ({ page, browser }) => {
    const survivor = buildAccount('survivor');
    const doomed = buildAccount('doomed');

    await signUp(page, survivor);
    await createPortfolio(page, 'Survivor Portfolio');

    const otherContext = await browser.newContext();
    const otherPage = await otherContext.newPage();

    await signUp(otherPage, doomed);
    await otherPage.goto('/dashboard/settings');
    await otherPage.getByLabel(/type/i).fill('DELETE');
    await otherPage.getByRole('button', { name: 'Delete my account' }).click();
    await otherPage.waitForURL((url) => !url.pathname.startsWith('/dashboard'));
    await otherContext.close();

    await page.goto('/dashboard');
    await expect(page.getByText('Survivor Portfolio').first()).toBeVisible();

    await signIn(page, survivor);
    await expect(page.getByText('Survivor Portfolio').first()).toBeVisible();
  });
});
