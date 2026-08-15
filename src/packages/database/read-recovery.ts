export type DatabaseRead<T> = () => Promise<T>;
export type ResetDatabaseClient = () => Promise<void>;

function isConnectionClosed(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const value = error as { code?: unknown; message?: unknown };
  return value.code === 'P1017' || value.message === 'ConnectionClosed';
}

/** Retries only a caller-proven idempotent read, once, after client reset. */
export async function executeDatabaseRead<T>(
  read: DatabaseRead<T>,
  reset: ResetDatabaseClient,
): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (!isConnectionClosed(error)) throw error;
    await reset();
    return read();
  }
}
