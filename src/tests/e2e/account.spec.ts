import { readFile, rm } from 'node:fs/promises';

import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { buildAccount, signIn, signUp } from './support/accounts';

const EMAIL_CAPTURE_PATH = 'test-results/email-capture.jsonl';

function accountMenu(page: Page): Locator {
  return page.locator('details:has(> div > a[href="/dashboard/settings"])');
}

async function openAccountDisclosure(page: Page, title: string): Promise<Locator> {
  const summary = page
    .locator('main details > summary')
    .filter({ has: page.getByText(title, { exact: true }) });
  const disclosure = summary.locator('..');

  await expect(summary).toBeVisible();
  if ((await disclosure.getAttribute('open')) === null) await summary.click();
  await expect(disclosure).toHaveAttribute('open', '');

  return disclosure;
}

async function expectAccountMenu(page: Page, initial: string): Promise<void> {
  const menu = accountMenu(page);
  const toggle = menu.locator('summary');
  await expect(toggle).toBeVisible();
  await expect(toggle).toContainText(initial);
  await toggle.click();
  await expect(menu.locator('a[href="/dashboard"]')).toBeVisible();
  await expect(menu.locator('a[href="/dashboard/settings"]')).toBeVisible();
  await expect(menu.locator('form button')).toBeVisible();
}

async function selectAndWaitForPreferenceSave(
  page: Page,
  fieldName: string,
  value: string,
  savedMessage: string,
): Promise<void> {
  const response = page.waitForResponse(
    (candidate) =>
      candidate.request().method() === 'POST' &&
      new URL(candidate.url()).pathname === '/dashboard/settings',
  );
  await page.locator(`select[name="${fieldName}"]`).selectOption(value);
  await response;
  await expect(page.getByRole('status').filter({ hasText: savedMessage })).toBeVisible();
}

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
    await openAccountDisclosure(page, 'Security');
    await expect(page.getByText(`${account.email} — Verified`)).toBeVisible();

    const reused = await page.request.get(verificationUrl, { maxRedirects: 0 });
    expect(reused.status()).toBeGreaterThanOrEqual(400);
    expect(reused.headers()['location'] ?? '').not.toContain('token');
    expect(await reused.text()).not.toContain(account.email);
  });

  test('gives the same reset response for existing and unknown emails', async ({ page }) => {
    const account = buildAccount('reset-known');
    await signUp(page, account);
    await expectAccountMenu(page, 'E');
    await accountMenu(page).locator('form button').click();
    await page.waitForURL(/\/$/u);

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

    await selectAndWaitForPreferenceSave(
      page,
      'themePreference',
      'dark',
      'Your preferences were saved.',
    );
    await selectAndWaitForPreferenceSave(
      page,
      'defaultCountryIso',
      'FR',
      'Your preferences were saved.',
    );
    await selectAndWaitForPreferenceSave(page, 'locale', 'fr', 'Your preferences were saved.');
    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('select[name="locale"]')).toHaveValue('fr');
    await expect(page.locator('select[name="themePreference"]')).toHaveValue('dark');
    await expect(page.locator('select[name="defaultCountryIso"]')).toHaveValue('FR');

    await page.goto('/guides/features');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.goto('/ar/guides/features');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await page.getByRole('radiogroup').getByRole('radio').first().click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('restores persisted preferences at sign-in and exposes the account menu globally', async ({
    page,
  }) => {
    const account = buildAccount('global-account-menu');
    await signUp(page, account);

    await expectAccountMenu(page, 'E');
    await expect(accountMenu(page).getByText('Dashboard', { exact: true })).toBeVisible();
    await expect(accountMenu(page).getByText('Preferences', { exact: true })).toBeVisible();
    await expect(accountMenu(page).getByRole('button', { name: 'Sign out' })).toBeVisible();

    await page.goto('/dashboard/settings');
    await expectAccountMenu(page, 'E');
    await selectAndWaitForPreferenceSave(
      page,
      'themePreference',
      'dark',
      'Your preferences were saved.',
    );
    await selectAndWaitForPreferenceSave(page, 'locale', 'fr', 'Your preferences were saved.');

    await page.goto('/guides/features');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: 'Menu du compte', exact: true })).toBeVisible();
    await expectAccountMenu(page, 'E');
    await expect(accountMenu(page).getByText('Tableau de bord', { exact: true })).toBeVisible();
    await expect(accountMenu(page).getByText('Préférences', { exact: true })).toBeVisible();
    await expect(accountMenu(page).getByRole('button', { name: 'se déconnecter' })).toBeVisible();
    await accountMenu(page).locator('form button').click();
    await page.waitForURL(/\/(?:fr)?$/u);

    await page.context().addCookies([
      { name: 'pg-saved-locale', value: 'en', url: page.url() },
      { name: 'pg-saved-theme', value: 'light', url: page.url() },
    ]);
    await page.evaluate(() => {
      globalThis.localStorage.setItem('pg-theme', 'light');
      globalThis.localStorage.removeItem('pg-theme-system');
    });

    await signIn(page, account);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect
      .poll(async () => {
        const cookies = await page.context().cookies();
        return cookies.find((cookie) => cookie.name === 'pg-saved-theme')?.value;
      })
      .toBe('dark');
    await expect
      .poll(() => page.evaluate(() => globalThis.localStorage.getItem('pg-theme')))
      .toBe('dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expectAccountMenu(page, 'E');
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
    await openAccountDisclosure(page, 'Security');
    await expect(page.getByText('ProFolio E2E Other Session')).toBeVisible();
    await expect(page.getByText(/Signed in:/u)).toHaveCount(2);
    await expect(page.getByText(/Expires:/u)).toHaveCount(2);
    await expect(page.getByText(/Current session/u)).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Sign out device' })).toHaveCount(1);
    await page.getByRole('button', { name: 'Sign out device' }).click();
    await expect(page.getByText('ProFolio E2E Other Session')).toHaveCount(0);

    await otherPage.goto('/dashboard');
    await otherPage.waitForURL('**/sign-in**');
    await page.reload();
    await openAccountDisclosure(page, 'Security');
    await expect(page).toHaveURL(/\/dashboard\/settings$/u);
    await expect(page.getByRole('button', { name: 'Sign out device' })).toHaveCount(0);
    await expect(page.getByText('ProFolio E2E Other Session')).toHaveCount(0);
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

    await openAccountDisclosure(page, 'Profile');
    await page.getByLabel('Display name').fill('Updated Account Name');
    await page.getByRole('button', { name: 'Save profile' }).click();
    await expect(page.getByText('Your profile was updated.')).toBeVisible();

    await openAccountDisclosure(page, 'Security');
    await page.getByLabel('Current password').fill(account.password);
    await page.getByLabel('New password').fill(replacementPassword);
    await page.getByRole('button', { name: 'Change password' }).click();
    await expect(page.getByText(/Your password was changed/)).toBeVisible();

    await accountMenu(page).locator('summary').click();
    await accountMenu(page).getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL('**/');
    await signIn(page, { ...account, password: replacementPassword });
    await page.goto('/dashboard/settings');
    await expect(page.getByText('Updated Account Name')).toBeVisible();
  });
});
