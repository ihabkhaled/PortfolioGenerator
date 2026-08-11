import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listAccountSessions } from '../services/session-management.service';

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  isSessionNotFreshError: vi.fn<(error: unknown) => boolean>(),
  listSessions: vi.fn(),
}));

vi.mock('@/packages/auth/server', () => ({
  getAuth: () => ({
    api: {
      getSession: auth.getSession,
      listSessions: auth.listSessions,
    },
  }),
  isSessionNotFreshError: auth.isSessionNotFreshError,
}));

beforeEach(() => {
  auth.getSession.mockReset();
  auth.isSessionNotFreshError.mockReset();
  auth.listSessions.mockReset();
});

describe('account session management', () => {
  it('returns only the owner sessions and identifies the current device', async () => {
    const current = {
      token: 'current-token',
      userId: 'owner-1',
      createdAt: new Date('2026-08-01T10:00:00.000Z'),
      expiresAt: new Date('2026-09-01T10:00:00.000Z'),
      userAgent: 'Chrome',
      ipAddress: '203.0.113.4',
    };
    auth.listSessions.mockResolvedValueOnce([
      current,
      { ...current, token: 'foreign-token', userId: 'owner-2' },
    ]);
    auth.getSession.mockResolvedValueOnce({ session: current });

    await expect(listAccountSessions('owner-1', new Headers())).resolves.toEqual({
      sessions: [
        {
          token: 'current-token',
          current: true,
          createdAt: current.createdAt,
          expiresAt: current.expiresAt,
          userAgent: 'Chrome',
          ipAddress: '203.0.113.4',
        },
      ],
      requiresRecentSignIn: false,
    });
  });

  it('keeps settings available when device management requires a recent sign-in', async () => {
    const error = new Error('Session is not fresh');
    auth.listSessions.mockRejectedValueOnce(error);
    auth.isSessionNotFreshError.mockReturnValueOnce(true);

    await expect(listAccountSessions('owner-1', new Headers())).resolves.toEqual({
      sessions: [],
      requiresRecentSignIn: true,
    });
    expect(auth.isSessionNotFreshError).toHaveBeenCalledWith(error);
    expect(auth.getSession).not.toHaveBeenCalled();
  });

  it('does not hide unrelated session-provider failures', async () => {
    const error = new Error('Database unavailable');
    auth.listSessions.mockRejectedValueOnce(error);
    auth.isSessionNotFreshError.mockReturnValueOnce(false);

    await expect(listAccountSessions('owner-1', new Headers())).rejects.toBe(error);
  });
});
