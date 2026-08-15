import { beforeEach, describe, expect, it, vi } from 'vitest';

import { signOutCurrentSession } from '../services/session.service';

const signOut = vi.fn();

vi.mock('@/packages/auth/server', () => ({
  getAuth: () => ({ api: { signOut } }),
}));
vi.mock('@/packages/logger', () => ({ logger: { warn: vi.fn() } }));
vi.mock('../repositories/user-account.repository', () => ({ getUserAccountStatus: vi.fn() }));

describe('signOutCurrentSession', () => {
  beforeEach(() => vi.clearAllMocks());

  it('treats an already-missing session as successful cleanup', async () => {
    signOut.mockRejectedValueOnce(new Error('session not found'));

    await expect(signOutCurrentSession(new Headers())).resolves.toBeUndefined();
  });
});
