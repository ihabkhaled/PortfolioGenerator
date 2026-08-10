import { describe, expect, it } from 'vitest';

import {
  isValidDownloadTokenShape,
  redisTokenKey,
  redisTokenOwnerKey,
} from '../policies/portfolio-pdf-token.policy';

describe('isValidDownloadTokenShape', () => {
  it('accepts 64 lowercase hex characters — exactly what a 32-byte token encodes to', () => {
    expect(isValidDownloadTokenShape('a'.repeat(64))).toBe(true);
    expect(isValidDownloadTokenShape('0123456789abcdef'.repeat(4))).toBe(true);
  });

  it('rejects a token that is too short or too long', () => {
    expect(isValidDownloadTokenShape('a'.repeat(63))).toBe(false);
    expect(isValidDownloadTokenShape('a'.repeat(65))).toBe(false);
  });

  it('rejects uppercase hex, since the token is always generated lowercase', () => {
    expect(isValidDownloadTokenShape('A'.repeat(64))).toBe(false);
  });

  it('rejects anything outside the hex alphabet', () => {
    expect(isValidDownloadTokenShape(`${'a'.repeat(63)}g`)).toBe(false);
    expect(isValidDownloadTokenShape('')).toBe(false);
  });

  it('rejects a portfolio id or slug passed in place of a token', () => {
    expect(isValidDownloadTokenShape('amina-rahman')).toBe(false);
    expect(isValidDownloadTokenShape('clh1a2b3c4d5e6f7g8h9')).toBe(false);
  });
});

describe('redisTokenKey', () => {
  it('namespaces the forward lookup', () => {
    expect(redisTokenKey('deadbeef')).toBe('pdf:token:deadbeef');
  });
});

describe('redisTokenOwnerKey', () => {
  it('namespaces the reverse lookup, separately from the forward one', () => {
    expect(redisTokenOwnerKey('portfolio-1')).toBe('pdf:token:owner:portfolio-1');
  });

  it('never collides with a forward token key for the same raw value', () => {
    expect(redisTokenOwnerKey('deadbeef')).not.toBe(redisTokenKey('deadbeef'));
  });
});
