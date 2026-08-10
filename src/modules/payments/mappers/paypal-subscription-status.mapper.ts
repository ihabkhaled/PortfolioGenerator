import { PAYPAL_STATUS_MAP } from '../constants/payments.constants';
import type { SubscriptionStatus } from '../types/payments.types';

/** Falls back to `TRIALING` for a PayPal status this app has not seen before,
 * so an unrecognised value never accidentally grants `ACTIVE` access. See
 * `PAYPAL_STATUS_MAP` for the mapping and why `APPROVAL_PENDING`/`APPROVED`
 * both land on `TRIALING`. */
export function fromPaypalSubscriptionStatus(status: string): SubscriptionStatus {
  return PAYPAL_STATUS_MAP[status] ?? 'TRIALING';
}
