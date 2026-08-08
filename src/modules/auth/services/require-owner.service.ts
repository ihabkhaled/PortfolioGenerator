import 'server-only';

import { headers } from 'next/headers';

import { appRedirect } from '@/packages/navigation';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import type { AuthenticatedUser } from '../types/auth.types';

import { getOptionalUser } from './session.service';

/**
 * The authorization boundary for every dashboard operation.
 *
 * Returns the owner or redirects. Callers must not "check later": the returned
 * id is the only tenant key allowed to reach a repository, and a page or action
 * that forgets to call this has no id to pass, so it does not compile.
 *
 * A redirect rather than a thrown error, for two reasons. A signed-out visitor
 * following a deep link should land on the sign-in form, not on an error
 * boundary. And an expected condition that logs at error level on ordinary
 * anonymous traffic teaches everyone to ignore error logs, which is exactly
 * what you do not want on the day something is actually wrong.
 */
export async function requireOwner(): Promise<AuthenticatedUser> {
  const requestHeaders = await headers();
  const user = await getOptionalUser(requestHeaders);

  if (!user) {
    appRedirect(ROUTE_PATHS.signIn);
  }

  return user;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const requestHeaders = await headers();

  return getOptionalUser(requestHeaders);
}
