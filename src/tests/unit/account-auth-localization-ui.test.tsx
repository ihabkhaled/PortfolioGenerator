import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactModule from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AccountPreferencesContainer,
  AccountProfileContainer,
  AccountSecurityContainer,
} from '@/modules/account/account-ui';
import {
  PasswordRecoveryForm,
  PasswordResetContainer,
  PasswordResetRequestContainer,
} from '@/modules/auth';
import { LocalizationControlsContainer, TranslationPanelContainer } from '@/modules/localization';
import { I18nLocaleProvider } from '@/packages/i18n';

import { buildFullPortfolioDocument } from '../fixtures/portfolio-document.fixtures';

const mocks = vi.hoisted(() => ({
  useActionState: vi.fn(),
  getBrowserLocation: vi.fn(),
  navigateBrowser: vi.fn(),
  copyBrowserText: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react', async () => {
  const original = await vi.importActual<typeof ReactModule>('react');
  return { ...original, useActionState: mocks.useActionState };
});

vi.mock('@/packages/browser', () => ({
  getBrowserLocation: mocks.getBrowserLocation,
  navigateBrowser: mocks.navigateBrowser,
  copyBrowserText: mocks.copyBrowserText,
}));

const idleState = { status: 'idle', error: null };
const action = vi.fn();

const profileLabels = {
  title: 'Profile',
  hint: 'Your account identity.',
  name: 'Name',
  submit: 'Save profile',
  pending: 'Saving profile',
  saved: 'Profile saved',
};

const securityLabels = {
  title: 'Security',
  hint: 'Protect your account.',
  verificationTitle: 'Email verification',
  verified: 'Verified',
  unverified: 'Not verified',
  resend: 'Resend verification',
  sending: 'Sending verification',
  sent: 'Verification sent',
  passwordTitle: 'Password',
  currentPassword: 'Current password',
  newPassword: 'New password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  changePassword: 'Change password',
  changingPassword: 'Changing password',
  passwordChanged: 'Password changed',
  sessionsTitle: 'Sessions',
  currentSession: 'Current session',
  revoke: 'Revoke',
  revoking: 'Revoking',
  created: 'Created',
  expires: 'Expires',
  unknownDevice: 'Unknown device',
  unknownAddress: 'Unknown address',
  noSessions: 'No sessions',
};

function queueActionState(
  state: { readonly status: string; readonly error: string | null } = idleState,
  pending = false,
): void {
  mocks.useActionState.mockReturnValueOnce([state, action, pending]);
}

function translationSnapshot(
  overrides: Partial<{
    reviewedDocument: ReturnType<typeof buildFullPortfolioDocument> | null;
    reviewedAt: Date | null;
    publishedAt: Date | null;
    publishedVersion: number;
    isStale: boolean;
  }> = {},
) {
  const document = buildFullPortfolioDocument();
  return {
    id: 'translation-ar',
    portfolioId: 'portfolio-1',
    locale: 'ar' as const,
    draftDocument: document,
    draftVersion: 3,
    sourceFingerprint: 'source-fingerprint',
    isStale: false,
    reviewedDocument: null,
    reviewedAt: null,
    publishedDocument: null,
    publishedVersion: 0,
    publishedAt: null,
    ...overrides,
  };
}

function renderTranslationPanel(snapshots = [translationSnapshot()]): void {
  render(
    <TranslationPanelContainer
      portfolioId="portfolio-1"
      localeOptions={[{ value: 'ar', label: 'Arabic' }]}
      snapshots={snapshots}
    />,
  );
}

beforeEach(() => {
  mocks.useActionState.mockReset();
  mocks.getBrowserLocation.mockReturnValue({
    pathname: '/amina',
    search: '?preview=1',
    hash: '#work',
    href: 'https://portfoliogenerate.test/amina?preview=1#work',
  });
});

describe('account settings containers', () => {
  it('renders the saved profile result', () => {
    queueActionState({ status: 'success', error: null });

    render(<AccountProfileContainer name="Ada Lovelace" labels={profileLabels} />);

    expect(screen.getByLabelText('Name')).toHaveValue('Ada Lovelace');
    expect(screen.getByRole('status')).toHaveTextContent('Profile saved');
  });

  it('translates and announces a profile error', () => {
    queueActionState({ status: 'error', error: 'errors.notFound' });

    render(<AccountProfileContainer name="Ada Lovelace" labels={profileLabels} />);

    expect(screen.getByRole('alert')).toBeVisible();
  });

  it('renders every preference and its persisted defaults', () => {
    queueActionState({ status: 'success', error: null });
    render(
      <AccountPreferencesContainer
        preferences={{ locale: 'ar', themePreference: 'dark', defaultCountryIso: null }}
        localeOptions={[
          { value: 'en', label: 'English' },
          { value: 'ar', label: 'Arabic' },
        ]}
        themeOptions={[
          { value: 'system', label: 'System' },
          { value: 'dark', label: 'Dark' },
        ]}
        countryOptions={[{ value: 'EG', label: 'Egypt' }]}
        labels={{
          locale: 'Language',
          theme: 'Theme',
          country: 'Country',
          noCountry: 'No country',
          submit: 'Save preferences',
          pending: 'Saving preferences',
          saved: 'Preferences saved',
        }}
      />,
    );

    expect(screen.getByLabelText('Language')).toHaveValue('ar');
    expect(screen.getByLabelText('Theme')).toHaveValue('dark');
    expect(screen.getByLabelText('Country')).toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent('Preferences saved');
  });

  it('hides verification and revoke controls for verified and current sessions', () => {
    queueActionState();
    queueActionState({ status: 'success', error: null });
    queueActionState();
    render(
      <AccountSecurityContainer
        email="ada@example.com"
        emailVerified
        labels={securityLabels}
        sessions={[
          {
            token: 'current',
            current: true,
            userAgent: null,
            ipAddress: null,
            createdAt: new Date('2026-08-01T10:00:00.000Z'),
            expiresAt: new Date('2026-09-01T10:00:00.000Z'),
          },
        ]}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Resend verification' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Revoke' })).not.toBeInTheDocument();
    expect(screen.getByText(/Unknown device.*Current session/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Password changed');
  });

  it('offers verification and revocation for an unverified account with another session', () => {
    queueActionState({ status: 'success', error: null });
    queueActionState();
    queueActionState(idleState, true);
    render(
      <AccountSecurityContainer
        email="ada@example.com"
        emailVerified={false}
        labels={securityLabels}
        sessions={[
          {
            token: 'other',
            current: false,
            userAgent: 'Firefox',
            ipAddress: '203.0.113.4',
            createdAt: new Date('2026-08-01T10:00:00.000Z'),
            expiresAt: new Date('2026-09-01T10:00:00.000Z'),
          },
        ]}
      />,
    );

    expect(screen.getByRole('button', { name: 'Resend verification' })).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('Verification sent');
    expect(screen.getByRole('button', { name: 'Revoking' })).toBeDisabled();
  });

  it('explains when there are no active sessions', () => {
    queueActionState();
    queueActionState();
    render(
      <AccountSecurityContainer
        email="ada@example.com"
        emailVerified
        labels={securityLabels}
        sessions={[]}
      />,
    );

    expect(screen.getByText('No sessions')).toBeInTheDocument();
  });

  it('announces a rejected current password instead of failing silently', () => {
    queueActionState();
    queueActionState({ status: 'error', error: 'errors.invalidCredentials' });
    render(
      <AccountSecurityContainer
        email="ada@example.com"
        emailVerified
        labels={securityLabels}
        sessions={[]}
      />,
    );

    expect(screen.getByRole('alert')).toBeVisible();
  });

  it('announces a failed verification email resend', () => {
    queueActionState({ status: 'error', error: 'errors.unknown' });
    queueActionState();
    render(
      <AccountSecurityContainer
        email="ada@example.com"
        emailVerified={false}
        labels={securityLabels}
        sessions={[]}
      />,
    );

    expect(screen.getByRole('alert')).toBeVisible();
  });

  it('announces a failed session revocation instead of discarding it', () => {
    queueActionState();
    queueActionState();
    queueActionState({ status: 'error', error: 'errors.unknown' });
    render(
      <AccountSecurityContainer
        email="ada@example.com"
        emailVerified
        labels={securityLabels}
        sessions={[
          {
            token: 'other',
            current: false,
            userAgent: null,
            ipAddress: null,
            createdAt: new Date('2026-08-01T10:00:00.000Z'),
            expiresAt: new Date('2026-09-01T10:00:00.000Z'),
          },
        ]}
      />,
    );

    expect(screen.getByRole('alert')).toBeVisible();
  });

  it('renders a parsed device label and locale-formatted timestamps', () => {
    queueActionState();
    queueActionState();
    queueActionState();
    render(
      <AccountSecurityContainer
        email="ada@example.com"
        emailVerified
        labels={securityLabels}
        sessions={[
          {
            token: 'chrome-windows',
            current: false,
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            ipAddress: '203.0.113.9',
            createdAt: new Date('2026-08-01T10:30:00.000Z'),
            expiresAt: new Date('2026-09-01T10:30:00.000Z'),
          },
        ]}
      />,
    );

    expect(screen.getByText('Chrome on Windows')).toBeInTheDocument();
    expect(screen.getByText(/Created: Aug 1, 2026, 10:30 AM/)).toBeInTheDocument();
    expect(screen.getByText(/Expires: Sep 1, 2026, 10:30 AM/)).toBeInTheDocument();
  });
});

describe('password recovery UI', () => {
  it('renders an enumeration-safe email request form', () => {
    render(
      <PasswordRecoveryForm
        mode="request"
        token={null}
        action={action}
        isPending={false}
        errorMessage={null}
        successMessage="If the account exists, check its inbox."
        emailLabel="Email"
        passwordLabel="Password"
        passwordHint="Use at least twelve characters."
        showPasswordLabel="Show password"
        hidePasswordLabel="Hide password"
        submitLabel="Send reset link"
        pendingLabel="Sending reset link"
        footer={null}
      />,
    );

    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeVisible();
  });

  it('carries the reset token and describes the password requirement', () => {
    render(
      <PasswordRecoveryForm
        mode="reset"
        token="reset-token"
        action={action}
        isPending
        errorMessage="The link is invalid."
        successMessage={null}
        emailLabel="Email"
        passwordLabel="New password"
        passwordHint="Use at least twelve characters."
        showPasswordLabel="Show password"
        hidePasswordLabel="Hide password"
        submitLabel="Reset password"
        pendingLabel="Resetting password"
        footer={null}
      />,
    );

    expect(screen.getByDisplayValue('reset-token')).toHaveAttribute('type', 'hidden');
    expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
      'Use at least twelve characters.',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('The link is invalid.');
    expect(screen.getByRole('button', { name: 'Resetting password' })).toBeDisabled();
  });

  it('shows the request completion returned by its action state', () => {
    queueActionState({ status: 'submitted', error: null });
    render(<PasswordResetRequestContainer />);

    expect(screen.getByRole('status')).toBeVisible();
  });

  it('shows reset errors and pending progress', () => {
    queueActionState({ status: 'error', error: 'errors.unknown' }, true);
    render(<PasswordResetContainer token="reset-token" />);

    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Saving new password' })).toBeDisabled();
  });

  it('shows reset completion', () => {
    queueActionState({ status: 'success', error: null });
    render(<PasswordResetContainer token="reset-token" />);

    expect(screen.getByRole('status')).toBeVisible();
  });
});

describe('localization controls', () => {
  it('carries the selected locale through a client subtree', () => {
    render(
      <I18nLocaleProvider locale="ar">
        <p>Localized child</p>
      </I18nLocaleProvider>,
    );

    expect(screen.getByText('Localized child')).toBeInTheDocument();
  });

  const controls = (
    <LocalizationControlsContainer
      locale="en"
      options={[
        { value: 'en', label: 'English' },
        { value: 'ar', label: 'Arabic' },
      ]}
      label="Language"
      copyUrl="Copy URL"
      copied="Copied"
    />
  );

  it('navigates to the selected locale while preserving query and hash', async () => {
    render(controls);

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'ar');

    expect(mocks.navigateBrowser).toHaveBeenCalledWith('/ar/amina?preview=1#work');
  });

  it('copies the complete public URL and confirms it', async () => {
    render(controls);

    await userEvent.click(await screen.findByRole('button', { name: 'Copy URL' }));

    expect(mocks.copyBrowserText).toHaveBeenCalledWith(
      'https://portfoliogenerate.test/amina?preview=1#work',
    );
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('does not offer URL copying on an authoring route', () => {
    mocks.getBrowserLocation.mockReturnValue({
      pathname: '/dashboard',
      search: '',
      hash: '',
      href: 'https://portfoliogenerate.test/dashboard',
    });
    render(controls);

    expect(screen.queryByRole('button', { name: 'Copy URL' })).not.toBeInTheDocument();
  });
});

describe('translation panel', () => {
  it('labels stale translations and blocks review and publication', () => {
    queueActionState();
    queueActionState();
    queueActionState();
    queueActionState();
    renderTranslationPanel([translationSnapshot({ isStale: true })]);
    expect(
      screen.getByText('Out of date — regenerate from the current English draft'),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Mark reviewed' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Publish translation' })).toBeDisabled();
  });
  it('renders a draft preview and prevents publishing before review', () => {
    queueActionState();
    queueActionState();
    queueActionState();
    queueActionState();
    renderTranslationPanel();

    expect(screen.getByText('Draft — review required')).toBeInTheDocument();
    expect(screen.getByText('Amina Rahman')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish translation' })).toBeDisabled();
    expect(
      screen.getByText(/"displayName": "Amina Rahman"/, { selector: 'pre' }),
    ).toBeInTheDocument();
  });

  it('distinguishes reviewed work from the currently published version', () => {
    const document = buildFullPortfolioDocument();
    queueActionState();
    queueActionState();
    queueActionState();
    queueActionState();
    renderTranslationPanel([
      translationSnapshot({
        reviewedDocument: document,
        reviewedAt: new Date('2026-08-09T12:00:00.000Z'),
        publishedAt: new Date('2026-08-08T12:00:00.000Z'),
        publishedVersion: 2,
      }),
    ]);

    expect(screen.getByText('Reviewed — ready to publish')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish translation' })).toBeEnabled();
  });

  it('marks a snapshot published when review is not newer', () => {
    const document = buildFullPortfolioDocument();
    queueActionState();
    queueActionState();
    queueActionState();
    queueActionState();
    renderTranslationPanel([
      translationSnapshot({
        reviewedDocument: document,
        reviewedAt: new Date('2026-08-08T12:00:00.000Z'),
        publishedAt: new Date('2026-08-09T12:00:00.000Z'),
        publishedVersion: 3,
      }),
    ]);

    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('announces the first action error and pending labels', () => {
    queueActionState({ status: 'error', error: 'translation.errors.generic' }, true);
    queueActionState(idleState, true);
    queueActionState(idleState, true);
    queueActionState();
    renderTranslationPanel();

    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Generating draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Marking reviewed' })).toBeDisabled();
  });
});
