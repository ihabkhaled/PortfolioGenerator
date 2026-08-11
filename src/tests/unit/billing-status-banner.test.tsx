import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BillingStatusBanner } from '@/modules/payments/payments-ui';

vi.mock('@/packages/icons', () => ({
  WarningIcon: () => <span data-testid="warning-icon" />,
}));

describe('BillingStatusBanner', () => {
  it('calls attention to a deactivated account', () => {
    render(<BillingStatusBanner tag="deactivated" message="Publishing is paused" />);
    expect(screen.getByText('Publishing is paused')).toBeInTheDocument();
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
  });

  it('does not show the warning icon for an active account', () => {
    render(<BillingStatusBanner tag="active" message="Subscription active" />);
    expect(screen.getByText('Subscription active')).toBeInTheDocument();
    expect(screen.queryByTestId('warning-icon')).not.toBeInTheDocument();
  });
});
