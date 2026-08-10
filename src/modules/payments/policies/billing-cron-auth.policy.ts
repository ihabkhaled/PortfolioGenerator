import { constantTimeEqual, sha256Hex } from '@/packages/cryptography';

/** Bearer-secret check for the scheduled deactivation sweep, matching
 * `isAuthorizedAssetDeletionCronRequest` — the same Vercel Cron contract, kept
 * as its own copy so the payments and assets modules stay independent of each
 * other rather than sharing a function neither conceptually owns. */
export function isAuthorizedBillingCronRequest(
  authorization: string | null,
  secret: string | undefined,
): boolean {
  if (authorization === null || secret === undefined) return false;

  const expected = `Bearer ${secret}`;
  const presentedDigest = Buffer.from(sha256Hex(authorization), 'hex');
  const expectedDigest = Buffer.from(sha256Hex(expected), 'hex');

  return constantTimeEqual(presentedDigest, expectedDigest);
}
