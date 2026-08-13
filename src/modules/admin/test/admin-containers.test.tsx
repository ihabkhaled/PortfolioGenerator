import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AdminAdminCreateFormContainer,
  AdminAdminDeleteContainer,
  AdminAdminStatusActionContainer,
  AdminChangePasswordFormContainer,
  AdminPermissionEditorContainer,
  AdminPortfolioDeleteContainer,
  AdminPortfolioSuspendToggleContainer,
  AdminSignInFormContainer,
  AdminSignOutButtonContainer,
  AdminTwoFactorEnrollContainer,
  AdminUserResetPasswordContainer,
  AdminUserStatusActionContainer,
} from '../admin-ui';

const reactMocks = vi.hoisted(() => ({ useActionState: vi.fn() }));
const actionMocks = vi.hoisted(() => ({
  startEnrollment: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<Record<string, unknown>>();
  return { ...react, useActionState: reactMocks.useActionState };
});
function translate(key: string): string {
  return key;
}
vi.mock('@/packages/i18n', () => ({
  I18N_NAMESPACES: { admin: 'admin' },
  useAppTranslation: () => translate,
}));
vi.mock('../actions/admin-auth.actions', () => ({
  adminConfirmTwoFactorEnrollmentAction: vi.fn(),
  adminSignInAction: vi.fn(),
  adminStartTwoFactorEnrollmentAction: actionMocks.startEnrollment,
  adminVerifyTwoFactorAction: vi.fn(),
}));

const formAction = vi.fn<(formData: FormData) => void>();

function actionState(state: unknown, pending = false): void {
  reactMocks.useActionState.mockReturnValue([state, formAction, pending]);
}

describe('admin containers', () => {
  beforeEach(() => {
    actionState({ status: 'idle', message: null, error: null });
  });

  it('maps sign-in and create-admin action states to visible copy', () => {
    const { rerender } = render(<AdminSignInFormContainer />);
    expect(screen.getByText('signIn.submitLabel')).toBeInTheDocument();
    actionState({ status: 'error', error: 'errors.invalidCredentials' }, true);
    rerender(<AdminSignInFormContainer />);
    expect(screen.getByRole('alert')).toHaveTextContent('errors.invalidCredentials');
    expect(screen.getByRole('button')).toHaveTextContent('signIn.pendingLabel');

    actionState({ status: 'success', message: 'admins.actions.success.created' });
    rerender(<AdminAdminCreateFormContainer />);
    expect(screen.getByRole('status')).toHaveTextContent('admins.actions.success.created');
    actionState({ status: 'error', message: 'admins.actions.errors.invalid' });
    rerender(<AdminAdminCreateFormContainer />);
    expect(screen.getByRole('alert')).toHaveTextContent('admins.actions.errors.invalid');
  });

  it('renders password and sign-out pending and outcome states', () => {
    actionState({ status: 'success', error: null }, true);
    const { rerender } = render(<AdminChangePasswordFormContainer />);
    expect(screen.getByRole('status')).toHaveTextContent('account.security.success');
    expect(screen.getByRole('button', { name: 'account.security.pending' })).toBeDisabled();
    actionState({ status: 'error', error: 'errors.weakPassword' });
    rerender(<AdminChangePasswordFormContainer />);
    expect(screen.getByRole('alert')).toHaveTextContent('errors.weakPassword');
    actionState(null, true);
    rerender(<AdminSignOutButtonContainer />);
    expect(screen.getByRole('button', { name: 'topBar.signOut' })).toBeDisabled();
  });

  it('arms and cancels both delete controls', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AdminPortfolioDeleteContainer portfolioId="p1" />);
    await user.click(screen.getByRole('button', { name: 'portfolios.actions.delete' }));
    expect(screen.getByText('portfolios.actions.deleteConfirmHint')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'portfolios.actions.deleteCancel' }));
    expect(screen.getByRole('button', { name: 'portfolios.actions.delete' })).toBeInTheDocument();

    rerender(<AdminAdminDeleteContainer adminId="a1" />);
    await user.click(screen.getByRole('button', { name: 'admins.actions.delete' }));
    expect(screen.getByText('admins.actions.deleteConfirmHint')).toBeInTheDocument();
    actionState({ status: 'error', message: 'admins.actions.errors.protected' });
    rerender(<AdminAdminDeleteContainer adminId="a1" />);
    expect(screen.getByRole('alert')).toHaveTextContent('admins.actions.errors.protected');
    actionState({ status: 'idle', message: null }, true);
    rerender(<AdminAdminDeleteContainer adminId="a1" />);
    expect(screen.getByRole('button', { name: 'admins.actions.deleting' })).toBeDisabled();
  });

  it('renders portfolio suspension directions and failures', () => {
    const { rerender } = render(
      <AdminPortfolioSuspendToggleContainer portfolioId="p1" isSuspended={false} />,
    );
    expect(screen.getByRole('button')).toHaveTextContent('portfolios.actions.suspend');
    rerender(<AdminPortfolioSuspendToggleContainer portfolioId="p1" isSuspended />);
    expect(screen.getByRole('button')).toHaveTextContent('portfolios.actions.activate');
    actionState({ status: 'error', error: 'portfolios.errors.unknown' }, true);
    rerender(<AdminPortfolioSuspendToggleContainer portfolioId="p1" isSuspended={false} />);
    expect(screen.getByRole('alert')).toHaveTextContent('portfolios.errors.unknown');
    expect(screen.getByRole('button')).toHaveTextContent('portfolios.actions.pending');
  });

  it('renders user status directions, confirmation, cancel, and outcomes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AdminUserStatusActionContainer userId="u1" currentStatus="ACTIVE" />,
    );
    await user.click(screen.getByRole('button', { name: 'users.actions.suspend' }));
    expect(screen.getByText('users.actions.confirmSuspend')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'users.actions.cancel' }));
    actionState({ status: 'success', message: 'users.actions.success.activated' });
    rerender(<AdminUserStatusActionContainer userId="u1" currentStatus="SUSPENDED" />);
    expect(screen.getByRole('status')).toHaveTextContent('users.actions.success.activated');
    actionState({ status: 'error', message: 'users.actions.errors.invalid' }, true);
    rerender(<AdminUserStatusActionContainer userId="u1" currentStatus="SUSPENDED" />);
    expect(screen.getByRole('alert')).toHaveTextContent('users.actions.errors.invalid');
    expect(screen.getByRole('button')).toHaveTextContent('users.actions.pending');
  });

  it('renders admin status directions and outcomes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AdminAdminStatusActionContainer adminId="a1" currentStatus="ACTIVE" />,
    );
    await user.click(screen.getByRole('button', { name: 'admins.actions.suspend' }));
    expect(screen.getByText('admins.actions.confirmSuspend')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'admins.actions.cancel' }));
    expect(screen.getByRole('button', { name: 'admins.actions.suspend' })).toBeInTheDocument();
    actionState({ status: 'success', message: 'admins.actions.success.activated' });
    rerender(<AdminAdminStatusActionContainer adminId="a1" currentStatus="SUSPENDED" />);
    expect(screen.getByRole('status')).toHaveTextContent('admins.actions.success.activated');
    actionState({ status: 'error', message: 'admins.actions.errors.invalid' });
    rerender(<AdminAdminStatusActionContainer adminId="a1" currentStatus="SUSPENDED" />);
    expect(screen.getByRole('alert')).toHaveTextContent('admins.actions.errors.invalid');
  });

  it('renders reset-password idle, success, error, and pending states', () => {
    const { rerender } = render(<AdminUserResetPasswordContainer userId="u1" />);
    expect(screen.getByRole('button')).toHaveTextContent('users.actions.resetPassword');
    actionState({ status: 'success', message: 'users.actions.success.resetSent' });
    rerender(<AdminUserResetPasswordContainer userId="u1" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    actionState({ status: 'error', message: 'users.actions.errors.resetFailed' }, true);
    rerender(<AdminUserResetPasswordContainer userId="u1" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('users.actions.resetPending');
  });

  it('arms permission editing and renders action outcomes', async () => {
    const user = userEvent.setup();
    const props = {
      targetId: 'a1',
      targetName: 'Ada',
      targetEmail: 'ada@example.com',
      targetRoleLabel: 'Admin',
      currentPermissions: ['RBAC_MANAGE'] as const,
      callerId: 'a1',
      changeAdminHref: '/managawy/rbac',
    };
    const { rerender } = render(<AdminPermissionEditorContainer {...props} />);
    await user.click(screen.getByRole('button', { name: 'rbac.editor.save' }));
    expect(screen.getByText('rbac.editor.confirmMessage')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'rbac.editor.cancel' }));
    actionState({ status: 'error', message: 'rbac.editor.errors.invalid' });
    rerender(<AdminPermissionEditorContainer {...props} />);
    expect(screen.getByRole('alert')).toHaveTextContent('rbac.editor.errors.invalid');
    actionState({ status: 'success', message: 'rbac.editor.success.saved' }, true);
    rerender(<AdminPermissionEditorContainer {...props} />);
    expect(screen.getByRole('status')).toHaveTextContent('rbac.editor.success.saved');
  });

  it('moves two-factor enrollment from password to QR', async () => {
    const user = userEvent.setup();
    actionMocks.startEnrollment.mockResolvedValue({
      totpUri: 'otpauth://totp/test',
      qrCodeDataUrl: 'data:image/png;base64,AA==',
      backupCodes: ['one'],
    });
    const { rerender } = render(<AdminTwoFactorEnrollContainer />);
    await user.type(screen.getByLabelText('twoFactor.passwordLabel'), 'secret');
    await user.click(screen.getByRole('button', { name: 'twoFactor.continueLabel' }));
    expect(await screen.findByAltText('twoFactor.qrAlt')).toBeInTheDocument();
    actionState({ status: 'error', error: 'errors.invalidCode' }, true);
    rerender(<AdminTwoFactorEnrollContainer />);
    expect(screen.getByRole('alert')).toHaveTextContent('errors.invalidCode');
    await user.type(screen.getByLabelText('twoFactor.confirmCodeLabel'), '123456');
    expect(screen.getByLabelText('twoFactor.confirmCodeLabel')).toHaveValue('123456');
  });
});
