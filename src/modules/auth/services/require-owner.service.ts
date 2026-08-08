import 'server-only';

import { headers } from 'next/headers';

import type { AuthenticatedUser } from '../types/auth.types';

import { getOptionalUser } from './session.service';

/**
 * The authorization boundary for every dashboard operation.
 *
 * Returns the owner or throws. Callers must not "check later": the returned id
 * is the only tenant key allowed to reach a repository, and a page or action
 * that forgets to call this has no id to pass, so it does not compile.
 */
export async function requireOwner(): Promise<AuthenticatedUser> {
  const requestHeaders = await headers();
  const user = await getOptionalUser(requestHeaders);

  if (!user) {
    throw new Error('UNAUTHENTICATED');
  }

  return user;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const requestHeaders = await headers();

  return getOptionalUser(requestHeaders);
}
