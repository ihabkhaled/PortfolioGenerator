import { randomUUID } from 'node:crypto';

import { hashPassword } from 'better-auth/crypto';

// Imported from the owning constants file rather than the `@/modules/admin/server`
// barrel: that barrel also re-exports the session service, which imports
// `next/headers` — resolvable inside a Next.js server context but not when this
// script runs directly under `node --experimental-strip-types`.
import { DEFAULT_ROLE_PERMISSIONS } from '@/modules/admin/constants/admin-permission.constants';
import { ADMIN_AUTH_MIN_PASSWORD_LENGTH } from '@/packages/admin-auth/admin-auth.constants';
import { getDatabase } from '@/packages/database';
import { getServerEnv } from '@/packages/env/server';

/**
 * Seeds exactly one super admin, exactly once, ever.
 *
 * Idempotency is "does any AdminUser with isSuperAdmin=true already exist",
 * not an upsert-by-email: an upsert would risk resetting an already-seeded
 * super admin's password on a later deploy just because ADMIN_SEED_PASSWORD
 * is still set in the environment. This script costs one indexed COUNT query
 * on every deploy after the first successful run, forever.
 *
 * Wired into `vercel-build` — runs on every production deploy. Not a Prisma
 * migration: a raw SQL migration cannot call better-auth's own password
 * hasher, and this script's whole point is that the seeded hash and the
 * admin-auth instance's own verification must never drift apart.
 *
 * Writes the `AdminUser`/`AdminAccount` pair directly with Prisma rather than
 * calling `getAdminAuth().api.signUpEmail`: that endpoint's `createUser` call
 * only ever sends better-auth's own core user fields, and `AdminUser.role` is
 * a required column with no default — the insert fails with "Argument `role`
 * is missing" before this script ever gets a chance to set it. Hashing with
 * `hashPassword` from `better-auth/crypto` (the same default hasher
 * `emailAndPassword` uses, since `src/packages/admin-auth/server.ts` does not
 * override it) and pairing it with an `AdminAccount` row shaped exactly like
 * better-auth's own credential-provider account
 * (`providerId: 'credential'`, `accountId: <adminUserId>`) keeps sign-in
 * verification identical to a normal `signInEmail` call.
 */
async function main(): Promise<void> {
  const database = getDatabase();
  const existingSuperAdminCount = await database.adminUser.count({
    where: { isSuperAdmin: true },
  });

  if (existingSuperAdminCount > 0) {
    console.log('[seed-super-admin] A super admin already exists — no-op.');
    return;
  }

  const env = getServerEnv();

  if (!env.ADMIN_SEED_EMAIL || !env.ADMIN_SEED_PASSWORD) {
    throw new Error(
      'ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must both be set to seed the first super admin.',
    );
  }

  if (env.ADMIN_SEED_PASSWORD.length < ADMIN_AUTH_MIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_SEED_PASSWORD must be at least ${ADMIN_AUTH_MIN_PASSWORD_LENGTH} characters.`,
    );
  }

  const adminUserId = randomUUID();
  const passwordHash = await hashPassword(env.ADMIN_SEED_PASSWORD);

  await database.$transaction([
    database.adminUser.create({
      data: {
        id: adminUserId,
        name: 'Super Admin',
        email: env.ADMIN_SEED_EMAIL,
        emailVerified: false,
        role: 'SUPER_ADMIN',
        permissions: [...DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN],
        isSuperAdmin: true,
        status: 'ACTIVE',
      },
    }),
    database.adminAccount.create({
      data: {
        id: randomUUID(),
        accountId: adminUserId,
        providerId: 'credential',
        adminUserId,
        password: passwordHash,
      },
    }),
  ]);

  console.log(`[seed-super-admin] Seeded super admin ${env.ADMIN_SEED_EMAIL}.`);
}

try {
  await main();
  process.exit(0);
} catch (error: unknown) {
  console.error('[seed-super-admin] Failed:', error);
  process.exit(1);
}
