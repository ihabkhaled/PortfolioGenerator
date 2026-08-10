'use client';
// client-boundary-reason: loads the PayPal JS SDK asynchronously in the
// browser and renders its interactive smart buttons (PayPal account and
// direct card entry in one control), which cannot run on the server.

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';

import { Skeleton } from '@/packages/ui-primitives';

import {
  getBillingPlanIdAction,
  recordApprovedSubscriptionAction,
} from '../actions/payments.actions';
import { paymentsClasses } from '../constants/payments-style.constants';
import type {
  CheckoutPhase,
  PaypalCheckoutContainerProps,
  PaypalNamespace,
} from '../types/payments.types';

declare global {
  // The PayPal JS SDK script (loaded below) attaches this global itself;
  // there is no npm package to import types from.
  const paypal: PaypalNamespace | undefined;
}

/**
 * PayPal's smart buttons: one control that natively offers both a PayPal
 * account and direct card entry, so no separate card processor is wired in.
 *
 * Two async resources gate the buttons — the plan id (a server action, since
 * there is no environment variable for it; see `plan.service.ts`) and the
 * PayPal JS SDK script — and a skeleton fills the space until both resolve.
 * `onApprove` does not itself grant access: it hands the subscription id to
 * `recordApprovedSubscriptionAction`, which verifies it server-to-server
 * before anything is written, and the webhook stays the system of record for
 * every status change after this first one.
 */
export function PaypalCheckoutContainer(
  props: Readonly<PaypalCheckoutContainerProps>,
): ReactElement {
  const { ownerId, clientId, labels } = props;
  const [phase, setPhase] = useState<CheckoutPhase>('loading');
  const [planId, setPlanId] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const buttonSlotRef = useRef<HTMLDivElement | null>(null);
  const hasRendered = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void getBillingPlanIdAction().then((resolvedPlanId) => {
      if (cancelled) {
        return;
      }

      if (resolvedPlanId === null) {
        setPhase('unavailable');

        return;
      }

      setPlanId(resolvedPlanId);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Order does not affect behaviour — every check here is a side-effect-free
    // read — only which operand the linter classifies as "simple".
    if (!sdkReady || planId === null || paypal === undefined || hasRendered.current) {
      return;
    }

    const container = buttonSlotRef.current;

    if (container === null) {
      return;
    }

    hasRendered.current = true;
    setPhase('ready');

    void paypal
      .Buttons({
        createSubscription: (_data, actions) =>
          actions.subscription.create({ plan_id: planId, custom_id: ownerId }),
        onApprove: (data) => {
          if (data.subscriptionID === undefined) {
            setPhase('failed');

            return;
          }

          setPhase('submitting');
          void recordApprovedSubscriptionAction(data.subscriptionID).then((result) => {
            setPhase(result.status === 'success' ? 'succeeded' : 'failed');
          });
        },
        onError: () => {
          setPhase('failed');
        },
      })
      .render(container);
  }, [ownerId, planId, sdkReady]);

  const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&vault=true&intent=subscription`;

  return (
    <div className={paymentsClasses.checkout}>
      <Script
        src={sdkUrl}
        strategy="afterInteractive"
        onLoad={() => {
          setSdkReady(true);
        }}
        onError={() => {
          setPhase('unavailable');
        }}
      />

      {phase === 'loading' ? <Skeleton className={paymentsClasses.buttonSkeleton} /> : null}
      {phase === 'unavailable' ? (
        <p className={paymentsClasses.status}>{labels.unavailable}</p>
      ) : null}
      {phase === 'submitting' ? (
        <p className={paymentsClasses.status}>{labels.processing}</p>
      ) : null}
      {phase === 'succeeded' ? <p className={paymentsClasses.status}>{labels.succeeded}</p> : null}
      {phase === 'failed' ? <p className={paymentsClasses.status}>{labels.failed}</p> : null}

      <div ref={buttonSlotRef} className={paymentsClasses.buttonSlot} />
    </div>
  );
}
