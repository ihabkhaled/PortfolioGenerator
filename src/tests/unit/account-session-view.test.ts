import { describe, expect, it } from 'vitest';

import { describeSessionDevice, formatSessionTimestamp } from '@/modules/account';

describe('describeSessionDevice', () => {
  it('returns null for a missing user agent, so the caller supplies its own label', () => {
    expect(describeSessionDevice(null)).toBeNull();
  });

  it('returns null for a blank user agent', () => {
    expect(describeSessionDevice(' '.repeat(3))).toBeNull();
  });

  it('labels a desktop Chrome session by browser and OS', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

    expect(describeSessionDevice(ua)).toBe('Chrome on Windows');
  });

  it('labels a macOS Firefox session', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0';

    expect(describeSessionDevice(ua)).toBe('Firefox on macOS');
  });

  it('labels an iOS Safari session', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

    expect(describeSessionDevice(ua)).toBe('Safari on iOS');
  });

  it('labels a Windows Edge session, preferring Edge over the Chrome token it also carries', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0';

    expect(describeSessionDevice(ua)).toBe('Edge on Windows');
  });

  it('labels an Android Chrome session, preferring Android over the Linux token it also carries', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36';

    expect(describeSessionDevice(ua)).toBe('Chrome on Android');
  });

  it('labels a Linux Chrome session', () => {
    const ua =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

    expect(describeSessionDevice(ua)).toBe('Chrome on Linux');
  });

  it('falls back to the OS alone when the browser is not recognised', () => {
    expect(describeSessionDevice('Windows NT 10.0 custom-agent')).toBe('Windows');
  });

  it('falls back to the browser alone when the OS is not recognised', () => {
    expect(describeSessionDevice('Firefox/126.0 custom-agent')).toBe('Firefox');
  });

  it('returns the raw string unchanged when neither browser nor OS is recognised', () => {
    expect(describeSessionDevice('ProFolio E2E Other Session')).toBe('ProFolio E2E Other Session');
  });
});

describe('formatSessionTimestamp', () => {
  it('formats a stable, locale-fixed, UTC-pinned timestamp', () => {
    expect(formatSessionTimestamp(new Date('2026-08-01T10:30:00.000Z'))).toBe(
      'Aug 1, 2026, 10:30 AM',
    );
  });
});
