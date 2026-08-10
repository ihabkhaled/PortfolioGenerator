import type { BillingStatusTag } from '../types/payments.types';

export const paymentsClasses = {
  section: 'grid gap-4 rounded-xl border border-border bg-surface-raised p-5',
  sectionTitle: 'font-display text-base font-semibold text-foreground',
  sectionHint: 'text-sm text-muted-foreground',
  priceRow: 'flex items-baseline gap-2',
  price: 'font-display text-2xl font-bold text-foreground',
  priceSuffix: 'text-sm text-muted-foreground',
  checkout: 'grid gap-3',
  buttonSkeleton: 'h-12 w-full max-w-xs rounded-full',
  buttonSlot: 'max-w-xs',
  status: 'text-sm text-muted-foreground',
  bannerRow: 'flex items-start gap-2',
  bannerText: 'min-w-0',
} as const;

/** Alert tone for each billing status tag. `deactivated` is the one state
 * that genuinely needs to alarm the owner; the rest are informational. */
export const BILLING_STATUS_TONE: Readonly<
  Record<BillingStatusTag, 'info' | 'success' | 'warning' | 'danger'>
> = {
  notStarted: 'info',
  trialing: 'info',
  deactivated: 'danger',
  active: 'success',
};
