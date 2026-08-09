import 'server-only';

import { updateOwnedAccountPreferences } from '../repositories/account.repository';
import type { AccountPreferences } from '../types/settings.types';

export { getOwnedAccountPreferences } from '../repositories/account.repository';

export async function saveOwnedAccountPreferences(
  ownerId: string,
  preferences: AccountPreferences,
): Promise<boolean> {
  return updateOwnedAccountPreferences(ownerId, preferences);
}
