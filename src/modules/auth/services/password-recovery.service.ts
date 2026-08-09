import 'server-only';

import { getAuth } from '@/packages/auth/server';
import { logger } from '@/packages/logger';

export async function requestPasswordRecovery(
  email: string,
  requestHeaders: Headers,
): Promise<void> {
  try {
    await getAuth().api.requestPasswordReset({
      body: { email, redirectTo: '/reset-password' },
      headers: requestHeaders,
    });
  } catch {
    // Unknown users, provider failures and successful delivery have the same
    // public outcome. Logging only the event keeps the address out of logs.
    logger.warn('auth.password_reset.request_failed');
  }
}

export async function consumePasswordRecovery(
  token: string,
  newPassword: string,
  requestHeaders: Headers,
): Promise<boolean> {
  try {
    await getAuth().api.resetPassword({
      body: { newPassword, token },
      headers: requestHeaders,
    });

    return true;
  } catch {
    logger.info('auth.password_reset.rejected');

    return false;
  }
}
