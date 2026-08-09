import { describe, expect, it } from 'vitest';

import { parseClamAvSignatureDate, signatureDatabaseIsFresh } from '@/packages/clamav';

describe('ClamAV signature readiness', () => {
  it('reads the signature timestamp from VERSION output', () => {
    expect(
      parseClamAvSignatureDate('ClamAV 1.4.2/27689/Mon Jul 22 09:42:03 2024\n')?.toISOString(),
    ).toBe('2024-07-22T09:42:03.000Z');
  });

  it('rejects VERSION output with missing or invalid signature timestamps', () => {
    expect(parseClamAvSignatureDate('ClamAV 1.4.2')).toBeNull();
    expect(parseClamAvSignatureDate('ClamAV 1.4.2/27689/not-a-date')).toBeNull();
  });

  it('rejects missing and stale signature metadata', () => {
    const now = new Date('2024-07-24T09:42:04.000Z');
    expect(signatureDatabaseIsFresh(null, now, 48)).toBe(false);
    expect(signatureDatabaseIsFresh(new Date('2024-07-22T09:42:03.000Z'), now, 48)).toBe(false);
    expect(signatureDatabaseIsFresh(new Date('2024-07-23T09:42:03.000Z'), now, 48)).toBe(true);
    expect(signatureDatabaseIsFresh(new Date('2024-07-24T09:42:05.000Z'), now, 48)).toBe(false);
    expect(signatureDatabaseIsFresh(new Date('2024-07-22T09:42:04.000Z'), now, 48)).toBe(true);
  });
});
