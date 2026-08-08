import { describe, expect, it } from 'vitest';

import { RESUME_KEY_PREFIX } from '../constants/storage.constants';
import {
  buildStorageKey,
  isValidStorageKey,
  sanitizeSegment,
} from '../policies/storage-key.policy';

/**
 * Storage keys address private CVs. A key that can be guessed, or that can
 * escape the storage root, is the worst bug this product could ship — so the
 * shape is an allowlist and this suite is about what it refuses.
 */

describe('sanitizeSegment', () => {
  it('keeps the safe alphabet', () => {
    expect(sanitizeSegment('abc-DEF_123')).toBe('abc-DEF_123');
  });

  it.each([
    ['../etc', 'etc'],
    ['a/b', 'ab'],
    ['a\\b', 'ab'],
    ['a b', 'ab'],
    ['a.b', 'ab'],
    ['%2e%2e', '2e2e'],
  ])('strips traversal characters from %j', (input, expected) => {
    expect(sanitizeSegment(input)).toBe(expected);
  });
});

describe('buildStorageKey', () => {
  it('produces owner, prefix and random segments', () => {
    expect(buildStorageKey('owner-1', RESUME_KEY_PREFIX, 'abc123')).toBe('owner-1/resumes/abc123');
  });

  it('produces a valid key even from hostile segments', () => {
    const key = buildStorageKey('../../root', 'resumes/../..', 'a/b');

    expect(isValidStorageKey(key)).toBe(true);
  });

  it('puts every one of an owner’s objects under one prefix, so deletion is one sweep', () => {
    const resume = buildStorageKey('owner-1', 'resumes', 'a1');
    const text = buildStorageKey('owner-1', 'extracted-text', 'b2');

    expect(resume.startsWith('owner-1/')).toBe(true);
    expect(text.startsWith('owner-1/')).toBe(true);
  });
});

describe('isValidStorageKey', () => {
  it('accepts a generated key', () => {
    expect(isValidStorageKey('owner-1/resumes/9f8e7d6c')).toBe(true);
  });

  it.each([
    ['a traversal attempt', 'owner-1/../secrets/file'],
    ['an absolute path', '/etc/passwd'],
    ['a backslash path', 'owner-1\\resumes\\file'],
    ['too few segments', 'owner-1/resumes'],
    ['too many segments', 'owner-1/resumes/a/b'],
    ['a dot segment', 'owner-1/./file'],
    ['an empty segment', 'owner-1//file'],
    ['a space', 'owner-1/resumes/my file'],
    ['an empty string', ''],
    ['a percent-encoded traversal', 'owner-1/%2e%2e/file'],
  ])('rejects %s', (_description, key) => {
    expect(isValidStorageKey(key)).toBe(false);
  });
});
