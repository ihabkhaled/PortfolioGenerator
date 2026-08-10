import { z } from '@/packages/zod';

/**
 * What the client hands back after the PayPal buttons' `onApprove` fires.
 *
 * A PayPal subscription id (`I-XXXXXXXXXXXX`) is bounded and always
 * uppercase-alphanumeric; the length ceiling is generous headroom, not a
 * measured value, so a format change on PayPal's side does not immediately
 * break this app.
 */
export const subscriptionApprovalSchema = z.object({
  subscriptionId: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/i, 'errors.invalid'),
});
