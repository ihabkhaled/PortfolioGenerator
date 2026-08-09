import { constantTimeEqual, deriveScryptKey, randomBytesBuffer } from '@/packages/cryptography';

import {
  PRIVATE_PAGE_PASSWORD_KEY_LENGTH,
  PRIVATE_PAGE_PASSWORD_HASH_VERSION,
  PRIVATE_PAGE_PASSWORD_SALT_LENGTH,
  PRIVATE_PAGE_SCRYPT_BLOCK_SIZE,
  PRIVATE_PAGE_SCRYPT_COST,
  PRIVATE_PAGE_SCRYPT_MAX_MEMORY,
  PRIVATE_PAGE_SCRYPT_PARALLELIZATION,
} from '../constants/private-page-access.constants';

export async function hashPrivatePagePassword(password: string): Promise<string> {
  const salt = randomBytesBuffer(PRIVATE_PAGE_PASSWORD_SALT_LENGTH);
  const key = await derivePrivatePagePasswordKey(password, salt);

  return [
    PRIVATE_PAGE_PASSWORD_HASH_VERSION,
    salt.toString('base64url'),
    key.toString('base64url'),
  ].join('$');
}

export async function verifyPrivatePagePassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [version, encodedSalt, encodedKey, extra] = storedHash.split('$', 4);

  if (
    version !== PRIVATE_PAGE_PASSWORD_HASH_VERSION ||
    !encodedSalt ||
    !encodedKey ||
    extra !== undefined
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(encodedSalt, 'base64url');
    const expected = Buffer.from(encodedKey, 'base64url');

    if (
      salt.length !== PRIVATE_PAGE_PASSWORD_SALT_LENGTH ||
      expected.length !== PRIVATE_PAGE_PASSWORD_KEY_LENGTH
    ) {
      return false;
    }

    const actual = await derivePrivatePagePasswordKey(password, salt);
    return constantTimeEqual(actual, expected);
  } catch {
    /* v8 ignore next -- native scrypt failures cannot be induced deterministically without mocking Node. */
    return false;
  }
}

export async function derivePrivatePagePasswordKey(
  password: string,
  salt: Buffer,
): Promise<Buffer> {
  return deriveScryptKey(password, salt, PRIVATE_PAGE_PASSWORD_KEY_LENGTH, {
    N: PRIVATE_PAGE_SCRYPT_COST,
    r: PRIVATE_PAGE_SCRYPT_BLOCK_SIZE,
    p: PRIVATE_PAGE_SCRYPT_PARALLELIZATION,
    maxmem: PRIVATE_PAGE_SCRYPT_MAX_MEMORY,
  });
}
