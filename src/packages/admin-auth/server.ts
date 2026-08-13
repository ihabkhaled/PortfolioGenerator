import 'server-only';

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { twoFactor } from 'better-auth/plugins';

import { getDatabase } from '@/packages/database';
import { getServerEnv } from '@/packages/env/server';

import {
  ADMIN_AUTH_API_BASE_PATH,
  ADMIN_AUTH_COOKIE_PREFIX,
  ADMIN_AUTH_MIN_PASSWORD_LENGTH,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from './admin-auth.constants';

/**
 * Owner of a second, fully isolated `better-auth` instance for `/managawy`.
 *
 * Every model name below points at a brand-new table with zero foreign keys
 * to the user-facing `users`/`sessions`/`accounts`/`verifications` tables —
 * see ADR-0010. Email/password is enabled only so `signInEmail` and the
 * `two-factor` plugin's own endpoints work; public sign-up is blocked in
 * `route-handlers.ts`, since the only way an `AdminUser` row is created in
 * this phase is `support/seed-super-admin.mts` calling `api.signUpEmail`
 * in-process.
 */
function createAdminAuth() {
  const env = getServerEnv();

  return betterAuth({
    appName: 'ProFolio Admin',
    secret: env.ADMIN_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: ADMIN_AUTH_API_BASE_PATH,
    database: prismaAdapter(getDatabase(), { provider: 'postgresql' }),
    user: { modelName: 'adminUser' },
    session: {
      modelName: 'adminSession',
      expiresIn: ADMIN_SESSION_MAX_AGE_SECONDS,
      updateAge: ADMIN_SESSION_MAX_AGE_SECONDS / 4,
    },
    account: { modelName: 'adminAccount' },
    verification: { modelName: 'adminVerification' },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: ADMIN_AUTH_MIN_PASSWORD_LENGTH,
      requireEmailVerification: false,
    },
    plugins: [
      twoFactor({
        issuer: 'ProFolio Admin',
        twoFactorTable: 'adminTwoFactor',
      }),
      // Must stay last: it forwards Set-Cookie from server actions.
      nextCookies(),
    ],
    advanced: {
      cookiePrefix: ADMIN_AUTH_COOKIE_PREFIX,
      useSecureCookies: env.NEXT_PUBLIC_APP_ENV === 'production',
      defaultCookieAttributes: { sameSite: 'strict', httpOnly: true },
    },
  });
}

export type AdminAuthInstance = ReturnType<typeof createAdminAuth>;

const cache: { value: AdminAuthInstance | null } = { value: null };

export function getAdminAuth(): AdminAuthInstance {
  if (cache.value) {
    return cache.value;
  }

  const instance = createAdminAuth();

  cache.value = instance;

  return instance;
}
