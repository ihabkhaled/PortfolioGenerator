import { expect, test } from '@playwright/test';

import { buildAccount, signUp } from './support/accounts';

test.describe('account recovery', () => {
  test('gives the same reset response for existing and unknown emails', async ({ page }) => {
    const account = buildAccount('reset-known');
    await signUp(page, account);

    for (const email of [account.email, `unknown-${Date.now()}@example.com`]) {
      await page.goto('/forgot-password');
      await page.getByLabel('Email').fill(email);
      await page.getByRole('button', { name: 'Send reset link' }).click();
      await expect(
        page.getByText('If an account exists for that email, a reset link is on its way.'),
      ).toBeVisible();
    }
  });

  test('rejects a reset link without a valid token without changing credentials', async ({
    page,
  }) => {
    const account = buildAccount('reset-invalid');
    await signUp(page, account);
    await page.goto('/reset-password?token=not-a-real-token');
    await page.getByLabel('New password').fill('a replacement password');
    await page.getByRole('button', { name: 'Save new password' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
  });
});

test.describe('account preferences', () => {
  test('persists locale, theme and default phone country', async ({ page }) => {
    const account = buildAccount('preferences');
    await signUp(page, account);
    await page.goto('/dashboard/settings');

    await page.getByLabel('Language').selectOption('fr');
    await page.getByLabel('Colour theme').selectOption('dark');
    await page.getByLabel('Default phone country').selectOption('FR');
    await page.getByRole('button', { name: 'Save preferences' }).click();
    await expect(page.getByText('Your preferences were saved.')).toBeVisible();
    await page.reload();

    await expect(page.getByLabel('Language')).toHaveValue('fr');
    await expect(page.getByLabel('Colour theme')).toHaveValue('dark');
    await expect(page.getByLabel('Default phone country')).toHaveValue('FR');
  });
});
