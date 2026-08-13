import 'dotenv/config';

import process from 'node:process';

import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const isContinuousIntegration = Boolean(process.env['CI']);

/**
 * E2E runs against a real Next.js production build and a real PostgreSQL test
 * database, with the deterministic AI provider selected through configuration.
 * Nothing in CI is allowed to reach a paid model, which is why `AI_PROVIDER` is
 * pinned here rather than inherited from the developer's shell.
 *
 * Port 3100 rather than 3000: a developer running `npm run dev` should not have
 * their session torn down by a test run.
 */
export default defineConfig({
  testDir: './src/tests',
  testMatch: ['e2e/**/*.spec.ts', 'accessibility/**/*.spec.ts'],
  fullyParallel: false,
  forbidOnly: isContinuousIntegration,
  retries: isContinuousIntegration ? 1 : 0,
  // One worker: the suite asserts on publish/unpublish transitions of shared
  // slugs, which are global by definition and cannot be parallelised safely.
  workers: 1,
  reporter: isContinuousIntegration ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command:
      `npm run db:migrate:deploy && npm run db:seed:admin && npm run build && ` +
      `npm run start -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !isContinuousIntegration,
    timeout: 300_000,
    env: {
      AI_PROVIDER: 'deterministic',
      BETTER_AUTH_URL: BASE_URL,
      NEXT_PUBLIC_APP_URL: BASE_URL,
      NODE_ENV: 'test',
      AUTH_REQUIRE_EMAIL_VERIFICATION: 'false',
      EMAIL_CAPTURE_PATH: 'test-results/email-capture.jsonl',
      // Read by `support/seed-super-admin.mts` (via `db:seed:admin` above)
      // and by `src/tests/e2e/support/admin-accounts.ts`, so both sides of
      // the E2E super-admin sign-in flow always agree on the same account —
      // CI supplies real values through the job env (see `.github/workflows/
      // e2e.yml`), and a local run falls back to these deterministic ones.
      ADMIN_SEED_EMAIL: process.env['ADMIN_SEED_EMAIL'] ?? 'e2e-super-admin@example.com',
      ADMIN_SEED_PASSWORD:
        process.env['ADMIN_SEED_PASSWORD'] ?? 'e2e-super-admin-password-16-chars',
    },
  },
});
