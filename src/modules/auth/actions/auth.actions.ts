'use server';

import { headers } from 'next/headers';

import { synchronizeOwnedAccountPreferences } from '@/modules/account/server';
import { getAuth, isEmailNotVerifiedError } from '@/packages/auth/server';
import type { AuthInstance } from '@/packages/auth/server';
import { logger } from '@/packages/logger';
import { appRedirect } from '@/packages/navigation';
import { parseSchema } from '@/packages/zod';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { AUTH_ERROR_KEYS, AUTH_FIELD_NAMES, AUTH_NOTICE_KEYS } from '../constants/auth.constants';
import {
  passwordResetRequestSchema,
  passwordResetSchema,
  signInSchema,
  signUpSchema,
} from '../schemas/auth.schema';
import {
  consumePasswordRecovery,
  requestPasswordRecovery,
} from '../services/password-recovery.service';
import { signOutCurrentSession } from '../services/session.service';
import type { AuthFormState, PasswordRecoveryState } from '../types/auth.types';

export async function requestPasswordResetAction(
  _previous: PasswordRecoveryState,
  formData: FormData,
): Promise<PasswordRecoveryState> {
  const parsed = parseSchema(passwordResetRequestSchema, {
    email: formData.get(AUTH_FIELD_NAMES.email),
  });

  if (parsed.ok) {
    await requestPasswordRecovery(parsed.value.email, await headers());
  }

  return { status: 'submitted', error: null };
}

export async function resetPasswordAction(
  _previous: PasswordRecoveryState,
  formData: FormData,
): Promise<PasswordRecoveryState> {
  const parsed = parseSchema(passwordResetSchema, {
    token: formData.get(AUTH_FIELD_NAMES.resetToken),
    newPassword: formData.get(AUTH_FIELD_NAMES.newPassword),
  });

  if (!parsed.ok) {
    return { status: 'error', error: AUTH_ERROR_KEYS.unknown };
  }

  const consumed = await consumePasswordRecovery(
    parsed.value.token,
    parsed.value.newPassword,
    await headers(),
  );
  if (!consumed) {
    return { status: 'error', error: AUTH_ERROR_KEYS.unknown };
  }

  return { status: 'success', error: null };
}

/**
 * Credential server actions.
 *
 * Two properties matter more than brevity here:
 *
 *   1. Failures collapse to a single message key. "No such user" and "wrong
 *      password" are the same answer, because a distinguishable one turns the
 *      sign-in form into an account-enumeration oracle.
 *   2. Nothing about the failure is logged with the email address attached.
 *      Auth logs are the last place a credential-stuffing list should be able
 *      to accumulate.
 */

export async function signInAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseSchema(signInSchema, {
    email: formData.get(AUTH_FIELD_NAMES.email),
    password: formData.get(AUTH_FIELD_NAMES.password),
  });

  if (!parsed.ok) {
    return { status: 'error', error: AUTH_ERROR_KEYS.invalidCredentials, notice: null };
  }

  let result: Awaited<ReturnType<AuthInstance['api']['signInEmail']>>;

  try {
    result = await getAuth().api.signInEmail({
      // Also the callback for a verification email resent as a side effect
      // of this call (emailVerification.sendOnSignIn) — see signUpEmail above.
      body: {
        email: parsed.value.email,
        password: parsed.value.password,
        callbackURL: ROUTE_PATHS.dashboard,
      },
      headers: await headers(),
    });
  } catch (error) {
    // Unverified is the one failure worth naming — see isEmailNotVerifiedError.
    // better-auth has just sent a fresh verification link as a side effect of
    // this same rejected attempt (emailVerification.sendOnSignIn).
    if (isEmailNotVerifiedError(error)) {
      logger.info('auth.sign_in.blocked_unverified');

      return { status: 'notice', error: null, notice: AUTH_NOTICE_KEYS.emailNotVerified };
    }

    logger.info('auth.sign_in.rejected');

    return { status: 'error', error: AUTH_ERROR_KEYS.invalidCredentials, notice: null };
  }

  try {
    await synchronizeOwnedAccountPreferences(result.user.id);
  } catch (error) {
    logger.warn('auth.preference_sync.failed', {
      reason: error instanceof Error ? error.name : 'unknown',
    });
  }

  appRedirect(ROUTE_PATHS.dashboard);
}

export async function signUpAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseSchema(signUpSchema, {
    name: formData.get(AUTH_FIELD_NAMES.name),
    email: formData.get(AUTH_FIELD_NAMES.email),
    password: formData.get(AUTH_FIELD_NAMES.password),
  });

  if (!parsed.ok) {
    const [firstIssue] = parsed.issues;

    return {
      status: 'error',
      error: firstIssue?.message ?? AUTH_ERROR_KEYS.unknown,
      notice: null,
    };
  }

  let result: Awaited<ReturnType<AuthInstance['api']['signUpEmail']>>;

  try {
    result = await getAuth().api.signUpEmail({
      body: {
        name: parsed.value.name,
        email: parsed.value.email,
        password: parsed.value.password,
        // Threaded into the verification email's link: clicking it, once
        // verified, lands the now-signed-in visitor on the dashboard instead
        // of the marketing homepage — see emailVerification.autoSignInAfterVerification.
        callbackURL: ROUTE_PATHS.dashboard,
      },
      headers: await headers(),
    });
  } catch {
    // better-auth reports a duplicate address as a generic failure. Telling
    // the user their email is taken is unavoidable on a sign-up form — they
    // need to know to sign in instead — but it is the only place we do it.
    logger.info('auth.sign_up.rejected');

    return { status: 'error', error: AUTH_ERROR_KEYS.emailTaken, notice: null };
  }

  // A null token means verification is required and no session was created —
  // the account exists but signing straight in would just bounce off the
  // dashboard's auth guard with no explanation. Telling the user to check
  // their email here, instead of redirecting and hoping, is the difference
  // between a working flow and an account that looks like it silently failed.
  if (result.token === null) {
    return { status: 'notice', error: null, notice: AUTH_NOTICE_KEYS.verificationEmailSent };
  }

  appRedirect(ROUTE_PATHS.dashboard);
}

export async function signOutAction(): Promise<void> {
  await signOutCurrentSession(await headers());

  appRedirect(ROUTE_PATHS.home);
}
