import 'server-only';

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';

import { getDatabase } from '@/packages/database';
import { getServerEnv } from '@/packages/env/server';

import { AUTH_MIN_PASSWORD_LENGTH, SESSION_MAX_AGE_SECONDS } from './auth.constants';

/**
 * Owner of `better-auth` on the server.
 *
 * Password hashing, session issuance, cookie flags and origin checks are the
 * library's job, deliberately: hand-rolled session formats and hand-rolled
 * hashing are where authentication goes wrong, and neither is a place to be
 * original. What this file owns is policy — session lifetime, the password
 * floor, and the fact that email/password is the only method enabled.
 */
function createAuth() {
  const env = getServerEnv();

  return betterAuth({
    appName: 'PortfolioGenerate',
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: prismaAdapter(getDatabase(), { provider: 'postgresql' }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: AUTH_MIN_PASSWORD_LENGTH,
      // Verification email delivery is not wired yet; requiring it would lock
      // every new account out. Tracked as a launch prerequisite in
      // docs/launch-readiness.md rather than silently left on.
      requireEmailVerification: false,
    },
    session: {
      expiresIn: SESSION_MAX_AGE_SECONDS,
      updateAge: SESSION_MAX_AGE_SECONDS / 4,
    },
    advanced: {
      useSecureCookies: env.NODE_ENV === 'production',
      defaultCookieAttributes: { sameSite: 'lax', httpOnly: true },
    },
    // Must stay last: it forwards Set-Cookie from server actions.
    plugins: [nextCookies()],
  });
}

export type AuthInstance = ReturnType<typeof createAuth>;

const cache: { value: AuthInstance | null } = { value: null };

export function getAuth(): AuthInstance {
  if (cache.value) {
    return cache.value;
  }

  const instance = createAuth();

  cache.value = instance;

  return instance;
}
