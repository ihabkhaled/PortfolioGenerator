import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminSignInFormContainer, AdminTwoFactorEnrollContainer } from '@/modules/admin/admin-ui';

const adminAuthActions = vi.hoisted(() => ({
  signIn: vi.fn(),
  verifyTwoFactor: vi.fn(),
  startEnrollment: vi.fn(),
  confirmEnrollment: vi.fn(),
}));

vi.mock('@/modules/admin/actions/admin-auth.actions', () => ({
  adminSignInAction: adminAuthActions.signIn,
  adminVerifyTwoFactorAction: adminAuthActions.verifyTwoFactor,
  adminStartTwoFactorEnrollmentAction: adminAuthActions.startEnrollment,
  adminConfirmTwoFactorEnrollmentAction: adminAuthActions.confirmEnrollment,
}));

/**
 * The action functions themselves are excluded from unit coverage (they need
 * a real session and a real better-auth instance to mean anything — see the
 * E2E suite) but the *container's own* branching on their result — which
 * form renders next — is real client behavior worth verifying directly,
 * mirroring how `payments-checkout.test.tsx` mocks
 * `@/modules/payments/actions/payments.actions`.
 */
describe('the admin sign-in container reacting to its own action result', () => {
  beforeEach(() => {
    adminAuthActions.signIn.mockReset();
    adminAuthActions.verifyTwoFactor.mockReset();
  });

  it('swaps to the authenticator-code field once the password step reports two-factor is required', async () => {
    const user = userEvent.setup();
    adminAuthActions.signIn.mockResolvedValue({ status: 'needs-two-factor', error: null });

    render(<AdminSignInFormContainer />);
    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'a-strong-password-123456');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByLabelText('Authenticator code')).toBeInTheDocument();
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  });

  it('announces a rejected password without ever reaching the code step', async () => {
    const user = userEvent.setup();
    adminAuthActions.signIn.mockResolvedValue({
      status: 'error',
      error: 'errors.invalidCredentials',
    });

    render(<AdminSignInFormContainer />);
    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'the-wrong-password');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.');
    expect(screen.queryByLabelText('Authenticator code')).not.toBeInTheDocument();
  });

  it('submits the code through adminVerifyTwoFactorAction once already past the password step', async () => {
    const user = userEvent.setup();
    adminAuthActions.signIn.mockResolvedValue({ status: 'needs-two-factor', error: null });
    adminAuthActions.verifyTwoFactor.mockResolvedValue({
      status: 'needs-two-factor',
      error: 'errors.invalidCode',
    });

    render(<AdminSignInFormContainer />);
    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'a-strong-password-123456');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(await screen.findByLabelText('Authenticator code'), '000000');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That code did not match. Try again.',
    );
    expect(adminAuthActions.verifyTwoFactor).toHaveBeenCalledOnce();
  });
});

describe('the admin two-factor enrollment container reacting to its own action result', () => {
  const enrollment = {
    totpUri: 'otpauth://totp/ProFolio%20Admin:admin%40example.com?secret=ABC&issuer=ProFolio',
    qrCodeDataUrl: 'data:image/png;base64,fake',
    backupCodes: ['aaaa-bbbb', 'cccc-dddd'],
  };

  beforeEach(() => {
    adminAuthActions.startEnrollment.mockReset();
    adminAuthActions.confirmEnrollment.mockReset();
  });

  it('reveals the QR code, secret, and backup codes once the password step resolves', async () => {
    const user = userEvent.setup();
    adminAuthActions.startEnrollment.mockResolvedValue(enrollment);

    render(<AdminTwoFactorEnrollContainer />);
    await user.type(screen.getByLabelText('Password'), 'a-strong-password-123456');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('aaaa-bbbb')).toBeInTheDocument();
    expect(screen.getByText('cccc-dddd')).toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(adminAuthActions.startEnrollment).toHaveBeenCalledWith('a-strong-password-123456');
  });

  it('announces a rejected confirmation code once past the password step', async () => {
    const user = userEvent.setup();
    adminAuthActions.startEnrollment.mockResolvedValue(enrollment);
    adminAuthActions.confirmEnrollment.mockResolvedValue({
      status: 'error',
      error: 'errors.invalidCode',
    });

    render(<AdminTwoFactorEnrollContainer />);
    await user.type(screen.getByLabelText('Password'), 'a-strong-password-123456');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(await screen.findByLabelText('Confirm the code from your app'), '000000');
    await user.click(screen.getByRole('button', { name: 'Confirm and continue' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That code did not match. Try again.',
    );
    expect(adminAuthActions.confirmEnrollment).toHaveBeenCalledOnce();
  });
});
