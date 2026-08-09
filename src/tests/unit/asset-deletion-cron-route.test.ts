import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/operations/asset-deletions/route';

const { isAuthorizedAssetDeletionCronRequest, retryDueAssetDeletions } = vi.hoisted(() => ({
  isAuthorizedAssetDeletionCronRequest: vi.fn(
    (authorization: string | null, secret: string | undefined) =>
      secret !== undefined && authorization === `Bearer ${secret}`,
  ),
  retryDueAssetDeletions: vi.fn(),
}));

vi.mock('@/modules/assets/server', () => ({
  ASSET_DELETION_BATCH_SIZE: 50,
  ASSET_DELETION_NO_STORE_HEADERS: { 'Cache-Control': 'no-store' },
  isAuthorizedAssetDeletionCronRequest,
  retryDueAssetDeletions,
}));

vi.mock('@/packages/env/server', () => ({
  getServerEnv: () => ({ CRON_SECRET: 'cron-secret-with-at-least-thirty-two-characters' }),
}));

const endpoint = 'http://localhost/api/operations/asset-deletions';
const secret = 'cron-secret-with-at-least-thirty-two-characters';

beforeEach(() => {
  retryDueAssetDeletions.mockReset();
});

describe('asset deletion cron route', () => {
  it.each([undefined, 'Bearer wrong-secret'])(
    '%s credentials cannot start deletion work',
    async (authorization) => {
      const init: RequestInit = authorization === undefined ? {} : { headers: { authorization } };
      const response = await GET(new Request(endpoint, init));

      expect(response.status).toBe(401);
      expect(retryDueAssetDeletions).not.toHaveBeenCalled();
    },
  );

  it('runs one fixed bounded batch and exposes only the processed count', async () => {
    retryDueAssetDeletions.mockResolvedValue(7);

    const response = await GET(
      new Request(endpoint, { headers: { authorization: `Bearer ${secret}` } }),
    );

    expect(response.status).toBe(200);
    expect(retryDueAssetDeletions).toHaveBeenCalledExactlyOnceWith(expect.any(Date), 50);
    expect(await response.json()).toEqual({ processed: 7 });
  });
});
