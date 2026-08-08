import 'server-only';

import { getAuth } from '@/packages/auth/server';
import { logger } from '@/packages/logger';

import type { AuthenticatedUser } from '../types/auth.types';

/**
 * Session resolution.
 *
 * Everything below this layer takes an `ownerId` string, never a session
 * object. That is what makes ownership checkable by reading a function
 * signature: a repository method that does not take an owner id cannot be
 * accidentally called with the wrong tenant's data, because it has no way to
 * express one.
 */

export async function getOptionalUser(requestHeaders: Headers): Promise<AuthenticatedUser | null> {
  try {
    const session = await getAuth().api.getSession({ headers: requestHeaders });

    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
  } catch (error) {
    // A failed session lookup is "signed out", never a 500: an expired or
    // malformed cookie must not take the whole page down.
    logger.warn('auth.session.lookup_failed', {
      reason: error instanceof Error ? error.name : 'unknown',
    });

    return null;
  }
}
