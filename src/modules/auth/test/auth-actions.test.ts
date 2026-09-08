import { beforeEach, describe, expect, it, vi } from 'vitest';

import { signInAction, signOutAction, signUpAction } from '../actions/auth.actions';

const mocks = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  signUpEmail: vi.fn(),
  synchronizePreferences: vi.fn(),
  getUserAccountStatus: vi.fn(),
  signOutCurrentSession: vi.fn(),
  isUserAlreadyExistsError: vi.fn(),
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
  isUserAlreadyExistsError: mocks.isUserAlreadyExistsError,
}));
vi.mock('@/packages/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
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

/**
 * The bug this locks down: a bare catch reported every sign-up failure —
 * including the schema error that meant no account row was ever written — as
 * "an account already exists for that email", which is how a real fault stayed
 * disguised as a credentials problem.
 */
describe('sign-up failure reporting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports emailTaken only for a genuine duplicate address', async () => {
    mocks.signUpEmail.mockRejectedValue(new Error('duplicate'));
    mocks.isUserAlreadyExistsError.mockReturnValue(true);

    const result = await signUpAction(
      { status: 'idle', error: null, notice: null },
      validSignUpForm(),
    );

    expect(result).toMatchObject({ status: 'error', error: 'errors.emailTaken' });
  });

  it('reports every other failure as unknown rather than as a taken email', async () => {
    mocks.signUpEmail.mockRejectedValue(new Error('column "issuer" does not exist'));
    mocks.isUserAlreadyExistsError.mockReturnValue(false);

    const result = await signUpAction(
      { status: 'idle', error: null, notice: null },
      validSignUpForm(),
    );

    expect(result).toMatchObject({ status: 'error', error: 'errors.unknown' });
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
