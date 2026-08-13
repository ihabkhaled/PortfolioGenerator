import 'server-only';

import { toNextJsHandler } from 'better-auth/next-js';

import { getAdminAuth } from './server';

/**
 * The App Router adapter for the admin `better-auth` instance.
 *
 * `sign-up/email` is deliberately refused here: the only way an `AdminUser`
 * row is created in this phase is `support/seed-super-admin.mts` calling
 * `getAdminAuth().api.signUpEmail` directly in-process, which never goes
 * through this HTTP route at all. Leaving the public route mounted would let
 * anyone self-register an admin account.
 */
export function createAdminAuthRouteHandlers(): ReturnType<typeof toNextJsHandler> {
  const handlers = toNextJsHandler(getAdminAuth());

  return {
    ...handlers,
    POST: (request: Request) => {
      if (new URL(request.url).pathname.endsWith('/sign-up/email')) {
        return Promise.resolve(new Response(null, { status: 404 }));
      }

      return handlers.POST(request);
    },
  };
}
