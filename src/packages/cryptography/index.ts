import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

export function randomBytesBuffer(length: number): Buffer {
  return randomBytes(length);
}

export function deriveScryptKey(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { readonly N: number; readonly r: number; readonly p: number; readonly maxmem: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, key) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(key);
    });
  });
}

export function hmacSha256Base64Url(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function constantTimeEqual(left: Buffer, right: Buffer): boolean {
  return left.length === right.length && timingSafeEqual(left, right);
}
