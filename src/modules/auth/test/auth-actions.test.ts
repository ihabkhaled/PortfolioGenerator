import { beforeEach, describe, expect, it, vi } from 'vitest';

import { signInAction, signOutAction, signUpAction } from '../actions/auth.actions';

const mocks = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  signUpEmail: vi.fn(),
  synchronizePreferences: vi.fn(),
  getUserAccountStatus: vi.fn(),
  signOutCurrentSession: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock('next/headers', () => ({ headers: vi.fn(() => Promise.resolve(new Headers())) }));
vi.mock('@/modules/account/server', () => ({
  synchronizeOwnedAccountPreferences: mocks.synchronizePreferences,
}));
vi.mock('@/packages/auth/server', () => ({
  getAuth: () => ({ api: { signInEmail: mocks.signInEmail, signUpEmail: mocks.signUpEmail } }),
  isEmailNotVerifiedError: () => false,
}));
vi.mock('@/packages/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn() },
}));
vi.mock('@/packages/navigation', () => ({ appRedirect: mocks.redirect }));
vi.mock('../repositories/user-account.repository', () => ({
  getUserAccountStatus: mocks.getUserAccountStatus,
}));
vi.mock('../services/session.service', () => ({
  signOutCurrentSession: mocks.signOutCurrentSession,
}));

function validSignInForm(): FormData {
  const form = new FormData();
  form.set('email', 'amina@example.com');
  form.set('password', 'correct-password-123');
  return form;
}

function validSignUpForm(): FormData {
  const form = new FormData();
  form.set('name', 'Amina Example');
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
    mocks.getUserAccountStatus.mockResolvedValue('ACTIVE');
    mocks.signOutCurrentSession.mockResolvedValue(undefined);
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

describe('verification-required sign-up', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signUpEmail.mockResolvedValue({ token: null });
  });

  it('redirects to sign-in with a verification notice', async () => {
    await expect(
      signUpAction({ status: 'idle', error: null, notice: null }, validSignUpForm()),
    ).rejects.toThrow('redirect:/sign-in?notice=verification-email-sent');
  });
});

describe('sign-out action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signOutCurrentSession.mockResolvedValue(undefined);
  });

  it('redirects home after the session cleanup even when it was already missing', async () => {
    await expect(signOutAction()).rejects.toThrow('redirect:/');
    expect(mocks.signOutCurrentSession).toHaveBeenCalledTimes(1);
  });
});
