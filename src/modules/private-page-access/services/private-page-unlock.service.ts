import { createPrivatePageGrant } from '../helpers/private-page-grant.helper';
import { verifyPrivatePagePassword } from '../helpers/private-page-password.helper';
import type { PrivatePageUnlockInput } from '../types/private-page-access.types';

export async function unlockPrivatePage(input: PrivatePageUnlockInput): Promise<string | null> {
  const matches = await verifyPrivatePagePassword(input.password, input.passwordHash);

  return matches ? createPrivatePageGrant(input) : null;
}
