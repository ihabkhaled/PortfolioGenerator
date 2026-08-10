import 'server-only';

import { APIError, BASE_ERROR_CODES, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';

import { getDatabase } from '@/packages/database';
import { createConfiguredEmailSender } from '@/packages/email/server';
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
    appName: 'ProFolio',
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: prismaAdapter(getDatabase(), { provider: 'postgresql' }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: AUTH_MIN_PASSWORD_LENGTH,
      requireEmailVerification: env.AUTH_REQUIRE_EMAIL_VERIFICATION,
      sendResetPassword: async ({ user, url }) => {
        await createConfiguredEmailSender().sendPasswordReset({ email: user.email, resetUrl: url });
      },
    },
    emailVerification: {
      sendOnSignUp: env.AUTH_REQUIRE_EMAIL_VERIFICATION,
      // A blocked sign-in (correct password, unverified email) resends a fresh
      // link in the same request. Without this, a user who lost or never
      // received the first email has no way back in: they cannot sign in to
      // reach the account page that would let them ask for another one.
      sendOnSignIn: env.AUTH_REQUIRE_EMAIL_VERIFICATION,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await createConfiguredEmailSender().sendEmailVerification({
          email: user.email,
          verificationUrl: url,
        });
      },
    },
    session: {
      expiresIn: SESSION_MAX_AGE_SECONDS,
      updateAge: SESSION_MAX_AGE_SECONDS / 4,
    },
    advanced: {
      useSecureCookies: env.NEXT_PUBLIC_APP_ENV === 'production',
      defaultCookieAttributes: { sameSite: 'lax', httpOnly: true },
    },
    // Must stay last: it forwards Set-Cookie from server actions.
    plugins: [nextCookies()],
  });
}

/**
 * True when a `signInEmail` rejection was specifically "this account exists
 * but its email is unverified," as opposed to a wrong password or no account.
 *
 * Sign-in otherwise collapses every failure to one message, deliberately, so
 * the form cannot be used to enumerate accounts. This one case is the
 * exception: without it, a user who signed up correctly has no way to learn
 * why they can never sign in, and no session to reach a resend action from.
 * The library itself distinguishes it (`FORBIDDEN` / `EMAIL_NOT_VERIFIED`), so
 * surfacing it costs nothing beyond what `sendOnSignUp` already reveals at
 * sign-up time for a duplicate address.
 */
export function isEmailNotVerifiedError(error: unknown): boolean {
  return error instanceof APIError && error.body?.code === BASE_ERROR_CODES.EMAIL_NOT_VERIFIED.code;
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
