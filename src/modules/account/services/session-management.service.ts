import 'server-only';

import { getAuth, isSessionNotFreshError } from '@/packages/auth/server';

import type { AccountSecuritySessions } from '../types/account-view.types';

export async function listAccountSessions(
  ownerId: string,
  requestHeaders: Headers,
): Promise<AccountSecuritySessions> {
  let sessions: Awaited<ReturnType<ReturnType<typeof getAuth>['api']['listSessions']>>;
  try {
    sessions = await getAuth().api.listSessions({ headers: requestHeaders });
  } catch (error) {
    if (isSessionNotFreshError(error)) {
      return { sessions: [], requiresRecentSignIn: true };
    }
    throw error;
  }
  const currentSession = await getAuth().api.getSession({ headers: requestHeaders });

  return {
    sessions: sessions
      .filter((session) => session.userId === ownerId)
      .map((session) => ({
        token: session.token,
        current: session.token === currentSession?.session.token,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        userAgent: session.userAgent ?? null,
        ipAddress: session.ipAddress ?? null,
      })),
    requiresRecentSignIn: false,
  };
}
