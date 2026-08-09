import { constantTimeEqual, sha256Hex } from '@/packages/cryptography';

export function isAuthorizedAssetDeletionCronRequest(
  authorization: string | null,
  secret: string | undefined,
): boolean {
  if (authorization === null || secret === undefined) return false;

  const expected = `Bearer ${secret}`;
  const presentedDigest = Buffer.from(sha256Hex(authorization), 'hex');
  const expectedDigest = Buffer.from(sha256Hex(expected), 'hex');

  return constantTimeEqual(presentedDigest, expectedDigest);
}
