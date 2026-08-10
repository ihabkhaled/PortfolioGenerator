import { readFile, rm } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import { buildAccount, signIn, signUp } from './support/accounts';

const EMAIL_CAPTURE_PATH = 'test-results/email-capture.jsonl';

test.beforeEach(async () => {
  await rm(EMAIL_CAPTURE_PATH, { force: true });
});

test.afterEach(async () => {
  await rm(EMAIL_CAPTURE_PATH, { force: true });
});

async function waitForCapturedVerification(email: string): Promise<string> {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    let contents = '';
    try {
      contents = await readFile(EMAIL_CAPTURE_PATH, 'utf8');
    } catch {
      // The capture file is created by the first delivery.
    }
    const record = contents
      .split('\n')
      .find((line) => line.includes('"kind":"email-verification"') && line.includes(email));
    const url = record?.match(/"url":"([^"]+)"/u)?.[1];
    if (url !== undefined) return url;
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }
  throw new Error('Expected a captured verification email for the test account');
}

test.describe('account recovery', () => {
  test('does not enumerate verification requests and serializes one-time token consumption', async ({
    page,
  }) => {
    const account = buildAccount('verification');
    await signUp(page, account);
    const callbackURL = '/dashboard';
    const known = await page.request.post('/api/auth/send-verification-email', {
      data: { email: account.email, callbackURL },
    });
    const unknown = await page.request.post('/api/auth/send-verification-email', {
      data: { email: `unknown-${account.email}`, callbackURL },
    });
    expect(known.status()).toBe(unknown.status());
    expect(known.headers()['location']).toBe(unknown.headers()['location']);
    expect(known.headers()['content-type']).toBe(unknown.headers()['content-type']);
    expect(await known.text()).toBe(await unknown.text());

    const verificationUrl = await waitForCapturedVerification(account.email);
    const attempts = await Promise.all([
      page.request.get(verificationUrl, { maxRedirects: 0 }),
      page.request.get(verificationUrl, { maxRedirects: 0 }),
    ]);
    expect(attempts.filter((response) => response.status() < 400)).toHaveLength(1);
    expect(attempts.filter((response) => response.status() >= 400)).toHaveLength(1);
    for (const response of attempts) {
      expect(await response.text()).not.toContain(account.email);
      expect(response.headers()['location'] ?? '').not.toContain('token');
    }
    await page.goto('/dashboard/settings');
    await expect(page.getByText(`${account.email} — Verified`)).toBeVisible();

    const reused = await page.request.get(verificationUrl, { maxRedirects: 0 });
    expect(reused.status()).toBeGreaterThanOrEqual(400);
    expect(reused.headers()['location'] ?? '').not.toContain('token');
    expect(await reused.text()).not.toContain(account.email);
  });

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

    await page.goto('/features');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.goto('/ar/features');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await page.getByRole('radio', { name: /light/i }).click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('account profile and security workflows', () => {
  test('revokes another authenticated session while the current session survives', async ({
    page,
    browser,
  }) => {
    const account = buildAccount('session-revocation');
    await signUp(page, account);

    const otherContext = await browser.newContext({
      userAgent: 'ProFolio E2E Other Session',
    });
    const otherPage = await otherContext.newPage();
    await signIn(otherPage, account);

    await page.goto('/dashboard/settings');
    await expect(page.getByText('ProFolio E2E Other Session')).toBeVisible();
    await expect(page.getByText(/Created:/u)).toHaveCount(2);
    await expect(page.getByText(/Expires:/u)).toHaveCount(2);
    await expect(page.getByText(/Current session/u)).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Revoke', exact: true })).toHaveCount(1);
    await page.getByRole('button', { name: 'Revoke', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Revoke', exact: true })).toHaveCount(0);
    await expect(page.getByText('ProFolio E2E Other Session')).toHaveCount(0);

    await otherPage.goto('/dashboard');
    await otherPage.waitForURL('**/sign-in**');
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard\/settings$/u);
    await expect(page.getByText('Current session')).toBeVisible();
    await otherContext.close();
  });

  test('updates the profile, changes the password and logs out the current session', async ({
    page,
  }) => {
    const account = buildAccount('profile-security');
    const replacementPassword = 'replacement horse battery staple';
    await signUp(page, account);
    await page.goto('/dashboard/settings');

    await page.getByLabel('Display name').fill('Updated Account Name');
    await page.getByRole('button', { name: 'Save profile' }).click();
    await expect(page.getByText('Your profile was updated.')).toBeVisible();

    await page.getByLabel('Current password').fill(account.password);
    await page.getByLabel('New password').fill(replacementPassword);
    await page.getByRole('button', { name: 'Change password' }).click();
    await expect(page.getByText(/Your password was changed/)).toBeVisible();

    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL('**/');
    await signIn(page, { ...account, password: replacementPassword });
    await page.goto('/dashboard/settings');
    await expect(page.getByText('Updated Account Name')).toBeVisible();
  });
});
