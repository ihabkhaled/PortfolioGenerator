import 'server-only';

import { toNextJsHandler } from 'better-auth/next-js';

import { getAuth } from './server';

/**
 * The App Router adapter for better-auth, kept inside the wrapper so
 * `src/app/api/auth/[...all]/route.ts` stays a two-line re-export and the
 * vendor import has exactly one home.
 */
export function createAuthRouteHandlers(): ReturnType<typeof toNextJsHandler> {
  const handlers = toNextJsHandler(getAuth());

  return {
    ...handlers,
    POST: (request: Request) => handlers.POST(withAnonymousVerificationResend(request)),
  };
}

function withAnonymousVerificationResend(request: Request): Request {
  if (new URL(request.url).pathname !== '/api/auth/send-verification-email') return request;

  request.headers.delete('cookie');
  return request;
}
