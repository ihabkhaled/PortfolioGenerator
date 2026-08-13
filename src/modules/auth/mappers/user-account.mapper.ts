import type { AccountStatus } from '../types/auth.types';
import type { UserAccountStatusRow } from '../types/user-account-row.types';

/**
 * Database row to domain value.
 *
 * `status` is widened to plain `string` at the Prisma boundary (see
 * `UserAccountStatusRow`); this is the one place it narrows back to the two
 * values the column can actually hold.
 */
export function toAccountStatus(row: UserAccountStatusRow): AccountStatus {
  return row.status as AccountStatus;
}
