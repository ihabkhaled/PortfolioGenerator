import { beforeEach, describe, expect, it, vi } from 'vitest';

import { claimEmailVerificationToken } from './email-verification-claim';

const database = vi.hoisted(() => ({
  emailVerificationTokenClaim: {
    updateMany: vi.fn(),
    createMany: vi.fn(),
  },
}));

vi.mock('@/packages/database', () => ({
  getDatabase: () => database,
}));

beforeEach(() => {
  vi.clearAllMocks();
  database.emailVerificationTokenClaim.updateMany.mockResolvedValue({ count: 0 });
  database.emailVerificationTokenClaim.createMany.mockResolvedValue({ count: 1 });
});

describe('claimEmailVerificationToken', () => {
  it('returns a claim when it wins the insert race', async () => {
    const claim = await claimEmailVerificationToken('token');

    expect(claim).not.toBeNull();
    expect(database.emailVerificationTokenClaim.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skipDuplicates: true,
      }),
    );
  });

  it('returns null when another request already claimed the token', async () => {
    database.emailVerificationTokenClaim.createMany.mockResolvedValue({ count: 0 });

    await expect(claimEmailVerificationToken('token')).resolves.toBeNull();
  });

  it('recovers an expired unconsumed claim before inserting', async () => {
    database.emailVerificationTokenClaim.updateMany.mockResolvedValue({ count: 1 });

    const claim = await claimEmailVerificationToken('token');

    expect(claim).not.toBeNull();
    expect(database.emailVerificationTokenClaim.createMany).not.toHaveBeenCalled();
  });

  it('propagates unexpected database errors', async () => {
    const error = new Error('database unavailable');
    database.emailVerificationTokenClaim.createMany.mockRejectedValue(error);

    await expect(claimEmailVerificationToken('token')).rejects.toBe(error);
  });
});
