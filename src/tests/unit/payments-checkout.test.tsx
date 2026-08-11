import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PaypalButtonsOptions } from '@/modules/payments';
import { PaypalCheckoutContainer } from '@/modules/payments/payments-ui';

const paymentActions = vi.hoisted(() => ({
  getPlan: vi.fn(),
  recordApproval: vi.fn(),
}));

vi.mock('@/modules/payments/actions/payments.actions', () => ({
  getBillingPlanIdAction: paymentActions.getPlan,
  recordApprovedSubscriptionAction: paymentActions.recordApproval,
}));

vi.mock('next/script', () => ({
  default: (props: {
    readonly src: string;
    readonly nonce?: string;
    readonly 'data-csp-nonce'?: string;
    readonly onLoad: () => void;
    readonly onError: () => void;
  }) => (
    <button
      data-src={props.src}
      data-script-nonce={props.nonce}
      data-sdk-csp-nonce={props['data-csp-nonce']}
      onClick={props.onLoad}
      onDoubleClick={props.onError}
    >
      SDK
    </button>
  ),
}));

const labels = {
  unavailable: 'Checkout unavailable',
  processing: 'Processing',
  succeeded: 'Subscription active',
  failed: 'Checkout failed',
};

describe('PayPal checkout', () => {
  beforeEach(() => {
    paymentActions.getPlan.mockReset();
    paymentActions.recordApproval.mockReset();
    Reflect.deleteProperty(globalThis, 'paypal');
  });

  it('reports an unavailable plan or SDK', async () => {
    paymentActions.getPlan.mockResolvedValue(null);
    render(
      <PaypalCheckoutContainer
        ownerId="owner-1"
        clientId="client/id"
        nonce="request-nonce"
        labels={labels}
      />,
    );

    expect(screen.getByRole('button', { name: 'SDK' })).toHaveAttribute(
      'data-src',
      expect.stringContaining('client-id=client%2Fid'),
    );
    expect(screen.getByRole('button', { name: 'SDK' })).toHaveAttribute(
      'data-src',
      expect.stringContaining('components=buttons'),
    );
    expect(screen.getByRole('button', { name: 'SDK' })).toHaveAttribute(
      'data-script-nonce',
      'request-nonce',
    );
    expect(screen.getByRole('button', { name: 'SDK' })).toHaveAttribute(
      'data-sdk-csp-nonce',
      'request-nonce',
    );
    expect(await screen.findByText(labels.unavailable)).toBeInTheDocument();

    fireEvent.doubleClick(screen.getByRole('button', { name: 'SDK' }));
    expect(screen.getByText(labels.unavailable)).toBeInTheDocument();
  });

  it('creates and verifies a subscription before reporting success', async () => {
    const user = userEvent.setup();
    paymentActions.getPlan.mockResolvedValue('plan-1');
    paymentActions.recordApproval.mockResolvedValue({ status: 'success', error: null });
    let options: PaypalButtonsOptions | undefined;
    const rendering = Promise.withResolvers<undefined>();
    const renderButtons = vi.fn(() => rendering.promise);
    Object.defineProperty(globalThis, 'paypal', {
      configurable: true,
      value: {
        Buttons: (next: PaypalButtonsOptions) => {
          options = next;
          return { render: renderButtons };
        },
      },
    });

    render(
      <PaypalCheckoutContainer
        ownerId="owner-1"
        clientId="client"
        nonce="request-nonce"
        labels={labels}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'SDK' }));
    await waitFor(() => {
      expect(renderButtons).toHaveBeenCalledOnce();
    });
    expect(screen.getByTestId('paypal-button-slot')).toHaveClass('invisible');
    act(() => {
      rendering.resolve(undefined);
    });
    await waitFor(() => {
      expect(screen.getByTestId('paypal-button-slot')).not.toHaveClass('invisible');
    });
    expect(options).toMatchObject({ cspNonce: 'request-nonce' });

    const create = vi.fn().mockResolvedValue('I-created');
    await expect(options?.createSubscription({}, { subscription: { create } })).resolves.toBe(
      'I-created',
    );
    expect(create).toHaveBeenCalledWith({ plan_id: 'plan-1', custom_id: 'owner-1' });

    act(() => options?.onApprove({ subscriptionID: 'I-approved' }));
    expect(screen.getByText(labels.processing)).toBeInTheDocument();
    expect(await screen.findByText(labels.succeeded)).toBeInTheDocument();
  });

  it('reports malformed, rejected, and errored approvals', async () => {
    const user = userEvent.setup();
    paymentActions.getPlan.mockResolvedValue('plan-1');
    paymentActions.recordApproval.mockResolvedValue({ status: 'error', error: 'failed' });
    let options: PaypalButtonsOptions | undefined;
    Object.defineProperty(globalThis, 'paypal', {
      configurable: true,
      value: {
        Buttons: (next: PaypalButtonsOptions) => {
          options = next;
          return { render: vi.fn().mockResolvedValue(undefined) };
        },
      },
    });

    render(<PaypalCheckoutContainer ownerId="owner-1" clientId="client" labels={labels} />);
    await user.click(screen.getByRole('button', { name: 'SDK' }));
    await waitFor(() => {
      expect(options).toBeDefined();
    });

    act(() => options?.onApprove({}));
    expect(screen.getByText(labels.failed)).toBeInTheDocument();

    act(() => options?.onApprove({ subscriptionID: 'I-rejected' }));
    expect(await screen.findByText(labels.failed)).toBeInTheDocument();

    act(() => options?.onError?.(new Error('sdk')));
    expect(screen.getByText(labels.failed)).toBeInTheDocument();
  });
});
