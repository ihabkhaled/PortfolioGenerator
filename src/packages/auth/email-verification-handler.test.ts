import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleEmailVerificationRequest } from './email-verification-handler';

const claims = vi.hoisted(() => ({
  claim: vi.fn(),
  consume: vi.fn(),
  release: vi.fn(),
  renew: vi.fn(),
}));

const auth = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('./email-verification-claim', () => ({
  claimEmailVerificationToken: claims.claim,
  consumeEmailVerificationClaim: claims.consume,
  releaseEmailVerificationClaim: claims.release,
  renewEmailVerificationClaim: claims.renew,
}));

vi.mock('./route-handlers', () => ({
  createAuthRouteHandlers: () => ({ GET: auth.get }),
}));

const request = new Request(
  'https://portfoliogenerate.test/api/auth/verify-email?token=secret-token',
);
const firstClaim = { tokenDigest: 'digest', leaseId: 'first-lease' };
const secondClaim = { tokenDigest: 'digest', leaseId: 'second-lease' };

function successfulRedirect(): Response {
  return new Response(null, {
    status: 302,
    headers: { location: 'https://portfoliogenerate.test/account' },
  });
}

beforeEach(() => {
  claims.claim.mockResolvedValue(firstClaim);
  claims.consume.mockResolvedValue(true);
  claims.release.mockResolvedValue(true);
  claims.renew.mockResolvedValue(true);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('email verification claim wrapper', () => {
  it('releases a claim when Better Auth redirects with an error', async () => {
    const failure = new Response(null, {
      status: 302,
      headers: {
        location: 'https://portfoliogenerate.test/account?error=INVALID_TOKEN',
      },
    });
    auth.get.mockResolvedValue(failure);

    const response = await handleEmailVerificationRequest(request);

    expect(response).toBe(failure);
    expect(claims.release).toHaveBeenCalledWith(firstClaim);
    expect(claims.consume).not.toHaveBeenCalled();
  });

  it('lets only the current lease owner return success after a stale takeover', async () => {
    const { promise: firstAuthResponse, resolve: resolveFirst } = Promise.withResolvers<Response>();
    claims.claim.mockResolvedValueOnce(firstClaim).mockResolvedValueOnce(secondClaim);
    claims.consume.mockImplementation((claim: typeof firstClaim) =>
      Promise.resolve(claim.leaseId === secondClaim.leaseId),
    );
    auth.get.mockReturnValueOnce(firstAuthResponse).mockResolvedValueOnce(successfulRedirect());

    const first = handleEmailVerificationRequest(request);
    await vi.waitFor(() => {
      expect(auth.get).toHaveBeenCalledTimes(1);
    });
    const second = handleEmailVerificationRequest(request);
    await vi.waitFor(() => {
      expect(auth.get).toHaveBeenCalledTimes(2);
    });

    const secondResponse = await second;
    resolveFirst(successfulRedirect());
    const firstResponse = await first;

    expect(secondResponse.status).toBe(302);
    expect(firstResponse.status).toBe(401);
    expect(await firstResponse.json()).toEqual({ error: 'verification-rejected' });
  });
});
