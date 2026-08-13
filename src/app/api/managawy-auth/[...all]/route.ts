import { createAdminAuthRouteHandlers } from '@/packages/admin-auth/route-handlers';

/**
 * Sign-in, sign-out, session and two-factor endpoints for `/managawy`.
 * `sign-up/email` is refused — see `route-handlers.ts`.
 */
export const { GET, POST } = createAdminAuthRouteHandlers();
