import type { ReactElement } from 'react';

import { WarningIcon } from '@/packages/icons';
import { Alert } from '@/packages/ui-primitives';

import { BILLING_STATUS_TONE, paymentsClasses } from '../constants/payments-style.constants';
import type { BillingStatusBannerProps } from '../types/payments.types';

/**
 * Props in, TSX out. The tag/message pairing — already resolved through i18n
 * and interpolated upstream by the caller — is the whole input; the tone
 * lookup is a plain data-table read, not a decision made here.
 */
export function BillingStatusBanner(props: Readonly<BillingStatusBannerProps>): ReactElement {
  return (
    <Alert tone={BILLING_STATUS_TONE[props.tag]} className={paymentsClasses.bannerRow}>
      {props.tag === 'deactivated' ? <WarningIcon aria-hidden size={18} /> : null}
      <span className={paymentsClasses.bannerText}>{props.message}</span>
    </Alert>
  );
}
