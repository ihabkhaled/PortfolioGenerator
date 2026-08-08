import 'server-only';

import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';

import { getServerEnv } from '@/packages/env/server';

/**
 * Owner of `@prisma/client`.
 *
 * Prisma 7 connects through a driver adapter, so the connection string comes
 * from the validated server environment rather than from the schema file —
 * one place reads configuration, and a bad `DATABASE_URL` fails at boot with a
 * readable message instead of at the first query.
 *
 * The client is created lazily and memoized on `globalThis`: Next.js
 * re-evaluates modules on every hot reload, and a fresh `PrismaClient` per
 * reload exhausts the connection pool within a few minutes of editing.
 */

const globalForPrisma = globalThis as unknown as { prismaClient?: PrismaClient };

export function getDatabase(): PrismaClient {
  const existing = globalForPrisma.prismaClient;

  if (existing) {
    return existing;
  }

  const env = getServerEnv();
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

  globalForPrisma.prismaClient = client;

  return client;
}

/**
 * SQL NULL for a nullable JSON column. Prisma distinguishes it from `JsonNull`
 * (the JSON value `null`), and confusing the two is how a cleared column reads
 * back as present-but-empty.
 */
export const DbNull = Prisma.DbNull;

export type { PrismaClient } from '@prisma/client';

export { Prisma } from '@prisma/client';
