import { createAuthRouteHandlers } from '@/packages/auth/route-handlers';

/**
 * Sign-up, sign-in, sign-out and session endpoints. Everything under this path
 * is handled by better-auth; the application never implements a credential flow
 * itself.
 */
export const { GET, POST } = createAuthRouteHandlers();
