import { describe, expect, it } from 'vitest';

import { nextAssetDeletionRetryAt } from '@/modules/assets';

describe('nextAssetDeletionRetryAt', () => {
  it('uses bounded exponential backoff', () => {
    const now = new Date('2026-08-09T12:00:00.000Z');

    expect(nextAssetDeletionRetryAt(now, 1).toISOString()).toBe('2026-08-09T12:01:00.000Z');
    expect(nextAssetDeletionRetryAt(now, 20).toISOString()).toBe('2026-08-10T12:00:00.000Z');
  });
});
