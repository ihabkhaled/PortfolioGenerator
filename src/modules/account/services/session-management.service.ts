import 'server-only';

import { getAuth } from '@/packages/auth/server';

import type { AccountSecuritySession } from '../types/account-view.types';

export async function listAccountSessions(
  ownerId: string,
  requestHeaders: Headers,
): Promise<readonly AccountSecuritySession[]> {
  const sessions = await getAuth().api.listSessions({ headers: requestHeaders });
  const currentSession = await getAuth().api.getSession({ headers: requestHeaders });

  return sessions
    .filter((session) => session.userId === ownerId)
    .map((session) => ({
      token: session.token,
      current: session.token === currentSession?.session.token,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      userAgent: session.userAgent ?? null,
      ipAddress: session.ipAddress ?? null,
    }));
}
