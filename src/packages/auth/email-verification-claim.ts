import 'server-only';

import { createHash, randomUUID } from 'node:crypto';

import { getDatabase } from '@/packages/database';

const CLAIM_LEASE_MS = 5 * 60 * 1000;

export interface EmailVerificationClaim {
  readonly tokenDigest: string;
  readonly leaseId: string;
}

function digestToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function claimEmailVerificationToken(
  token: string,
): Promise<EmailVerificationClaim | null> {
  const database = getDatabase();
  const now = new Date();
  const claim = {
    tokenDigest: digestToken(token),
    leaseId: randomUUID(),
  };
  const leaseExpiresAt = new Date(now.getTime() + CLAIM_LEASE_MS);
  const recovered = await database.emailVerificationTokenClaim.updateMany({
    where: {
      tokenDigest: claim.tokenDigest,
      consumedAt: null,
      leaseExpiresAt: { lte: now },
    },
    data: { leaseId: claim.leaseId, leaseExpiresAt },
  });
  if (recovered.count === 1) return claim;

  const inserted = await database.emailVerificationTokenClaim.createMany({
    data: { ...claim, leaseExpiresAt },
    skipDuplicates: true,
  });
  return inserted.count === 1 ? claim : null;
}

export async function renewEmailVerificationClaim(claim: EmailVerificationClaim): Promise<boolean> {
  const now = new Date();
  const renewed = await getDatabase().emailVerificationTokenClaim.updateMany({
    where: {
      ...claim,
      consumedAt: null,
      leaseExpiresAt: { gt: now },
    },
    data: { leaseExpiresAt: new Date(now.getTime() + CLAIM_LEASE_MS) },
  });
  return renewed.count === 1;
}

export async function consumeEmailVerificationClaim(
  claim: EmailVerificationClaim,
): Promise<boolean> {
  const consumed = await getDatabase().emailVerificationTokenClaim.updateMany({
    where: { ...claim, consumedAt: null },
    data: { consumedAt: new Date(), leaseId: null, leaseExpiresAt: null },
  });
  return consumed.count === 1;
}

export async function releaseEmailVerificationClaim(
  claim: EmailVerificationClaim,
): Promise<boolean> {
  const released = await getDatabase().emailVerificationTokenClaim.deleteMany({
    where: { ...claim, consumedAt: null },
  });
  return released.count === 1;
}
