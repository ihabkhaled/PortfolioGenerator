import { describe, expect, it } from 'vitest';

import { isAuthorizedAssetDeletionCronRequest } from '@/modules/assets/server';

describe('isAuthorizedAssetDeletionCronRequest', () => {
  const secret = 'cron-secret-with-at-least-thirty-two-characters';

  it('accepts the configured bearer credential', () => {
    expect(isAuthorizedAssetDeletionCronRequest(`Bearer ${secret}`, secret)).toBe(true);
  });

  it.each([null, '', 'Bearer', 'Basic credentials', 'Bearer wrong-secret'])(
    'refuses an absent or invalid credential: %s',
    (authorization) => {
      expect(isAuthorizedAssetDeletionCronRequest(authorization, secret)).toBe(false);
    },
  );
});
