import { describe, expect, it } from 'vitest';

import { isSafeExternalUrl, normalizeSafeUrl, toDisplayUrl } from '@/shared/utils/safe-url.util';

/**
 * The URL policy is the boundary between "a model extracted a string from a
 * PDF" and "a visitor's browser follows a link". Every case here is a real
 * payload shape, not a synthetic edge case.
 */
describe('normalizeSafeUrl', () => {
  it.each([
    ['https://example.com/', 'https://example.com/'],
    ['https://example.com/a/b?q=1#f', 'https://example.com/a/b?q=1#f'],
    ['  https://example.com/  ', 'https://example.com/'],
    ['mailto:person@example.com', 'mailto:person@example.com'],
  ])('accepts %s', (input, expected) => {
    expect(normalizeSafeUrl(input)).toBe(expected);
  });

  it.each([
    ['a javascript: payload', 'javascript:alert(1)'],
    ['a data: payload', 'data:text/html;base64,PHNjcmlwdD4='],
    ['a vbscript: payload', 'vbscript:msgbox(1)'],
    ['a file: URL', 'file:///etc/passwd'],
    ['plain http', 'http://example.com'],
    ['a bare host', 'example.com'],
    ['a protocol-relative URL', '//example.com'],
    ['an empty string', ''],
    ['whitespace only', ' '.repeat(3)],
    ['a relative path', '/about'],
  ])('rejects %s', (_description, input) => {
    expect(normalizeSafeUrl(input)).toBeNull();
  });

  it('rejects a scheme smuggled past a prefix check with a control character', () => {
    expect(normalizeSafeUrl(`java${String.fromCodePoint(10)}script:alert(1)`)).toBeNull();
    expect(normalizeSafeUrl(`https://example.com/${String.fromCodePoint(0)}`)).toBeNull();
  });

  it('rejects a URL longer than the schema allows', () => {
    expect(normalizeSafeUrl(`https://example.com/${'a'.repeat(2100)}`)).toBeNull();
  });

  it('normalizes extra slashes rather than inventing a hostless URL', () => {
    // `https:///path` is not host-less: the parser reads `path` as the host.
    expect(normalizeSafeUrl('https:///path')).toBe('https://path/');
  });
});

describe('isSafeExternalUrl', () => {
  it('agrees with normalizeSafeUrl', () => {
    expect(isSafeExternalUrl('https://example.com')).toBe(true);
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('toDisplayUrl', () => {
  it.each([
    ['https://github.com/example/repo', 'github.com/example/repo'],
    ['https://example.com', 'example.com'],
    ['https://example.com/', 'example.com'],
    ['mailto:person@example.com', 'person@example.com'],
  ])('shortens %s', (input, expected) => {
    expect(toDisplayUrl(input)).toBe(expected);
  });

  it('returns the input unchanged when it is not a safe URL, because this is presentation only', () => {
    expect(toDisplayUrl('not a url')).toBe('not a url');
  });
});
