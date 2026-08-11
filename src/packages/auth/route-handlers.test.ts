import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAuthRouteHandlers } from './route-handlers';

const adapter = vi.hoisted(() => ({
  post: vi.fn<(request: Request) => Promise<Response>>(),
}));

vi.mock('better-auth/next-js', () => ({
  toNextJsHandler: () => ({
    GET: vi.fn(),
    POST: adapter.post,
  }),
}));

vi.mock('./server', () => ({ getAuth: vi.fn() }));

beforeEach(() => {
  adapter.post.mockResolvedValue(Response.json({ status: true }));
});

describe('auth route handlers', () => {
  it('removes the session cookie from verification resend requests', async () => {
    const { POST } = createAuthRouteHandlers();
    const request = new Request('https://portfoliogenerate.test/api/auth/send-verification-email', {
      method: 'POST',
      headers: {
        cookie: 'better-auth.session_token=secret',
        origin: 'https://portfoliogenerate.test',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email: 'person@example.com' }),
    });

    await POST(request);

    const forwarded = adapter.post.mock.calls[0]?.[0];
    expect(forwarded).toBe(request);
    expect(forwarded?.headers.get('cookie')).toBeNull();
    expect(forwarded?.headers.get('origin')).toBe('https://portfoliogenerate.test');
    await expect(forwarded?.json()).resolves.toEqual({ email: 'person@example.com' });
  });

  it('forwards cookies to every other auth endpoint', async () => {
    const { POST } = createAuthRouteHandlers();
    const request = new Request('https://portfoliogenerate.test/api/auth/sign-out', {
      method: 'POST',
      headers: { cookie: 'better-auth.session_token=secret' },
    });

    await POST(request);

    expect(adapter.post).toHaveBeenCalledWith(request);
  });
});
