import 'server-only';

import { getDatabase } from '@/packages/database';

/**
 * Account-level data access.
 *
 * Deleting a user is a hard delete, and the cascades in the schema do the rest:
 * sessions, credentials, portfolios, uploads and AI runs go with it. Audit
 * events do not — their owner reference is `SetNull`, so the record that a
 * publish or an account deletion happened survives the person it concerned
 * while the identifying data does not. That asymmetry is the point: an
 * append-only log that could be erased by the party it constrains is not a log.
 */
export async function hardDeleteUser(userId: string): Promise<boolean> {
  const deleted = await getDatabase().user.deleteMany({ where: { id: userId } });

  return deleted.count > 0;
}

export async function userExists(userId: string): Promise<boolean> {
  const row = await getDatabase().user.findFirst({ where: { id: userId }, select: { id: true } });

  return row !== null;
}
