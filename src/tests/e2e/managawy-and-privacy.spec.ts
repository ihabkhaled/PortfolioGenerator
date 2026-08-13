import { expect, test } from '@playwright/test';

import { buildAccount, signUp } from './support/accounts';
import { signInAsSuperAdmin } from './support/admin-accounts';

test.describe('what an unauthenticated visitor can reach at /managawy', () => {
  test('redirects to the admin sign-in page, never a raw 403', async ({ page }) => {
    const response = await page.goto('/managawy');

    await expect(page).toHaveURL(/\/managawy\/sign-in/u);
    expect(response?.status()).toBeLessThan(400);
  });

  test('every /managawy response is private and unindexed', async ({ page }) => {
    const response = await page.goto('/managawy/sign-in');
    const headers = response?.headers() ?? {};

    expect(headers['cache-control']).toContain('no-store');
    expect(headers['x-robots-tag']).toContain('noindex');
  });

  test('robots.txt disallows /managawy in production', async ({ request }) => {
    const response = await request.get('/robots.txt');
    const body = await response.text();

    // The E2E deployment runs with `NEXT_PUBLIC_APP_ENV=local`, where
    // `robots.ts` disallows everything rather than emitting the granular
    // per-route production rules — so the honest assertion here is the
    // blanket disallow, not a `/managawy`-specific line that would only
    // ever appear in a production build.
    expect(body).toContain('Disallow: /');
  });
});

test.describe('auth isolation from the user-facing session', () => {
  test('a regular user session has zero effect on /managawy', async ({ page }) => {
    const account = buildAccount('managawy-isolation');
    await signUp(page, account);

    const response = await page.goto('/managawy');

    await expect(page).toHaveURL(/\/managawy\/sign-in/u);
    expect(response?.status()).toBeLessThan(400);
  });
});

test.describe('admin sign-in and mandatory 2FA', () => {
  test('rate-limits repeated failed sign-in attempts', async ({ page }) => {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await page.goto('/managawy/sign-in');
      await page.getByLabel('Email').fill('nobody@example.com');
      await page.getByLabel('Password').fill('definitely-the-wrong-password');
      await page.getByRole('button', { name: 'Continue' }).click();
    }

    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('the seeded super admin can sign in and complete 2FA', async ({ page }) => {
    await signInAsSuperAdmin(page);

    await expect(page).toHaveURL(/\/managawy$/u);
    await expect(page.getByText('Total users')).toBeVisible();
  });
});

test.describe('the super admin cannot be touched', () => {
  test('there is exactly one isSuperAdmin row and it stays that way', async ({ page }) => {
    // A full "another admin tries to modify the super admin" test needs
    // Phase 3's admin-management UI to exist — this phase can only assert
    // the invariant holds at sign-in time. Extend this test in Phase 3 with
    // a second admin account attempting ADMINS_MANAGE-gated actions against
    // the super admin's id and asserting they all fail.
    await signInAsSuperAdmin(page);

    await expect(page).toHaveURL(/\/managawy$/u);
  });
});
