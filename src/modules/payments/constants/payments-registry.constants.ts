import type { PaypalAccessToken } from '../types/payments.types';

/**
 * Process-wide slot for the cached PayPal OAuth2 token, the same holder
 * pattern as `RATE_LIMITER_REGISTRY`. PayPal tokens last roughly eight hours;
 * caching one in memory means a page render or a webhook does not buy a fresh
 * token on every call.
 */
export const PAYPAL_TOKEN_REGISTRY: { value: PaypalAccessToken | null } = { value: null };
