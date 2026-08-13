import type { Page } from '@playwright/test';
import { TOTP, URI } from 'otpauth';

/**
 * Credentials for the seeded super admin — `support/seed-super-admin.mts` is
 * run against the E2E database (see `playwright.config.ts`'s `webServer`)
 * with these same values, so the account this file signs in as always
 * exists by the time a spec runs.
 */
export const ADMIN_SEED_EMAIL = process.env['ADMIN_SEED_EMAIL'] ?? 'e2e-super-admin@example.com';
export const ADMIN_SEED_PASSWORD =
  process.env['ADMIN_SEED_PASSWORD'] ?? 'e2e-super-admin-password-16-chars';

/**
 * The TOTP instance parsed from the enrollment page's raw secret, cached for
 * the lifetime of this test run.
 *
 * The Playwright suite runs with a single worker against one shared E2E
 * database (see `playwright.config.ts`), so the super admin is enrolled in
 * 2FA exactly once — by whichever test happens to sign in first — and every
 * later sign-in in the same run finds an already-enrolled account. A test
 * cannot scan a QR code, and the enrollment page renders the raw secret only
 * once, during that first enrollment, so the parsed `TOTP` instance is kept
 * here and reused to generate a fresh code for every subsequent sign-in.
 */
const cachedTotpRegistry: { value: TOTP | null } = { value: null };

/**
 * Completes the two-step enrollment flow: confirm the password again, then
 * confirm a TOTP code generated from the secret embedded in the enrollment
 * page's `otpauth://` URI.
 */
async function enrollTwoFactor(page: Page): Promise<void> {
  await page.getByLabel('Password').fill(ADMIN_SEED_PASSWORD);
  await page.getByRole('button', { name: 'Continue' }).click();

  const totpUriText = await page.locator('p', { hasText: 'otpauth://' }).textContent();
  if (totpUriText === null) {
    throw new TypeError('Expected the enrollment page to show the TOTP URI');
  }

  const totp = URI.parse(totpUriText);
  if (!(totp instanceof TOTP)) {
    throw new TypeError('Expected the enrollment page URI to describe a TOTP secret');
  }

  cachedTotpRegistry.value = totp;

  await page.getByLabel(/code/i).fill(totp.generate());
  await page.getByRole('button', { name: 'Confirm and continue' }).click();
}

/**
 * Signs in as the seeded super admin and completes 2FA — enrollment on the
 * first sign-in this test run performs, or a fresh TOTP code from the cached
 * secret on every later one.
 *
 * The password step lands on one of two states, and which one only becomes
 * visible after the sign-in server action's response has actually landed —
 * checking `page.url()` right after `.click()` resolves is a race against
 * that response (`.click()` resolves once the event dispatches, not once
 * the resulting navigation or re-render settles). Waiting for whichever of
 * the two outcomes' own markers appears — the enrollment route's URL for a
 * first-time sign-in, or the inline TOTP field for an already-enrolled
 * account (that path never navigates: `adminSignInAction` returns
 * `needs-two-factor` state without redirecting) — makes the branch below
 * correct regardless of which one wins.
 */
export async function signInAsSuperAdmin(page: Page): Promise<void> {
  await page.goto('/managawy/sign-in');
  await page.getByLabel('Email').fill(ADMIN_SEED_EMAIL);
  await page.getByLabel('Password').fill(ADMIN_SEED_PASSWORD);

  const totpField = page.getByLabel('Authenticator code');

  await Promise.all([
    page.getByRole('button', { name: 'Continue' }).click(),
    Promise.race([
      page.waitForURL('**/two-factor/enroll'),
      totpField.waitFor({ state: 'visible' }),
    ]),
  ]);

  if (page.url().includes('/managawy/two-factor/enroll')) {
    await enrollTwoFactor(page);
    return;
  }

  if (cachedTotpRegistry.value === null) {
    throw new Error(
      'The super admin is already enrolled in 2FA but no TOTP secret was cached from an ' +
        'earlier enrollment in this run — the account must have been enrolled outside this ' +
        'test run (e.g. by a stale database), which this helper cannot recover from.',
    );
  }

  await totpField.fill(cachedTotpRegistry.value.generate());
  await page.getByRole('button', { name: 'Continue' }).click();
}
