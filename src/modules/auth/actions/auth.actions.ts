'use server';

import { headers } from 'next/headers';

import { getAuth } from '@/packages/auth/server';
import { logger } from '@/packages/logger';
import { appRedirect } from '@/packages/navigation';
import { parseSchema } from '@/packages/zod';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { AUTH_ERROR_KEYS, AUTH_FIELD_NAMES } from '../constants/auth.constants';
import { signInSchema, signUpSchema } from '../schemas/auth.schema';
import type { AuthFormState } from '../types/auth.types';

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
    return { status: 'error', error: AUTH_ERROR_KEYS.invalidCredentials };
  }

  try {
    await getAuth().api.signInEmail({
      body: { email: parsed.value.email, password: parsed.value.password },
      headers: await headers(),
    });
  } catch {
    logger.info('auth.sign_in.rejected');

    return { status: 'error', error: AUTH_ERROR_KEYS.invalidCredentials };
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

    return { status: 'error', error: firstIssue?.message ?? AUTH_ERROR_KEYS.unknown };
  }

  try {
    await getAuth().api.signUpEmail({
      body: {
        name: parsed.value.name,
        email: parsed.value.email,
        password: parsed.value.password,
      },
      headers: await headers(),
    });
  } catch {
    // better-auth reports a duplicate address as a generic failure. Telling
    // the user their email is taken is unavoidable on a sign-up form — they
    // need to know to sign in instead — but it is the only place we do it.
    logger.info('auth.sign_up.rejected');

    return { status: 'error', error: AUTH_ERROR_KEYS.emailTaken };
  }

  appRedirect(ROUTE_PATHS.dashboard);
}

export async function signOutAction(): Promise<void> {
  try {
    await getAuth().api.signOut({ headers: await headers() });
  } catch {
    logger.warn('auth.sign_out.failed');
  }

  appRedirect(ROUTE_PATHS.home);
}
