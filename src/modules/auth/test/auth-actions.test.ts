import { beforeEach, describe, expect, it, vi } from 'vitest';

import { signInAction } from '../actions/auth.actions';

const mocks = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  synchronizePreferences: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock('next/headers', () => ({ headers: vi.fn(() => Promise.resolve(new Headers())) }));
vi.mock('@/modules/account/server', () => ({
  synchronizeOwnedAccountPreferences: mocks.synchronizePreferences,
}));
vi.mock('@/packages/auth/server', () => ({
  getAuth: () => ({ api: { signInEmail: mocks.signInEmail } }),
  isEmailNotVerifiedError: () => false,
}));
vi.mock('@/packages/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn() },
}));
vi.mock('@/packages/navigation', () => ({ appRedirect: mocks.redirect }));

function validSignInForm(): FormData {
  const form = new FormData();
  form.set('email', 'amina@example.com');
  form.set('password', 'correct-password-123');
  return form;
}

describe('signInAction preference synchronization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signInEmail.mockResolvedValue({
      user: { id: 'user-42' },
      token: 'session-token',
    });
    mocks.synchronizePreferences.mockResolvedValue(undefined);
  });

  it('synchronizes persisted preferences for the authenticated user before redirecting', async () => {
    await expect(
      signInAction({ status: 'idle', error: null, notice: null }, validSignInForm()),
    ).rejects.toThrow('redirect:/dashboard');

    expect(mocks.synchronizePreferences).toHaveBeenCalledExactlyOnceWith('user-42');
    expect(mocks.redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('still redirects a valid login when preference synchronization fails', async () => {
    mocks.synchronizePreferences.mockRejectedValue(new Error('cookie write failed'));

    await expect(
      signInAction({ status: 'idle', error: null, notice: null }, validSignInForm()),
    ).rejects.toThrow('redirect:/dashboard');

    expect(mocks.redirect).toHaveBeenCalledWith('/dashboard');
  });
});
