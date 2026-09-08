import { describe, expect, it } from 'vitest';

import {
  coerceExtractedUrl,
  isSafeExternalUrl,
  normalizeSafeUrl,
  toDisplayUrl,
} from '@/shared/utils/safe-url.util';

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

describe('coerceExtractedUrl', () => {
  /**
   * Every one of these is a real line from a CV that previously imported as a
   * removed link: a bare host, a protocol-relative address, and the leading
   * dot left behind by "LinkedIn:.linkedin.com/...".
   */
  it('repairs an address a CV wrote for a human rather than a parser', () => {
    expect(coerceExtractedUrl('github.com/ihabkhaled')).toBe('https://github.com/ihabkhaled');
    expect(coerceExtractedUrl('.linkedin.com/in/name')).toBe('https://linkedin.com/in/name');
    expect(coerceExtractedUrl('//eseed.net')).toBe('https://eseed.net/');
    expect(coerceExtractedUrl('http://garment.io')).toBe('https://garment.io/');
  });

  it('refuses a dangerous scheme rather than rewriting it into a safe-looking one', () => {
    expect(coerceExtractedUrl('javascript:alert(1)')).toBeNull();
    expect(coerceExtractedUrl('data:text/html,<script>')).toBeNull();
    expect(coerceExtractedUrl('vbscript:msgbox')).toBeNull();
  });

  it('does not read a bare host:port as a scheme', () => {
    expect(coerceExtractedUrl('example.com:8080/path')).toBe('https://example.com:8080/path');
  });

  it('leaves an already-safe address alone and rejects an empty one', () => {
    expect(coerceExtractedUrl('mailto:ihab@example.com')).toBe('mailto:ihab@example.com');
    expect(coerceExtractedUrl(' '.repeat(3))).toBeNull();
  });
});
