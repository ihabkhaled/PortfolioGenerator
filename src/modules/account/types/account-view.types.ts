import type { AccountPreferences } from './settings.types';

export interface DeleteAccountLabels {
  readonly title: string;
  readonly hint: string;
  readonly confirmationLabel: string;
  readonly confirmationHelp: string;
  readonly submit: string;
  readonly submitting: string;
}

export interface DeletePortfolioProps {
  readonly portfolioId: string;
  readonly label: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly submittingLabel: string;
  readonly confirmMessage: string;
}

export interface AccountSummaryProps {
  readonly title: string;
  readonly emailLabel: string;
  readonly email: string;
  readonly nameLabel: string;
  readonly name: string;
  readonly portfolioCountLabel: string;
  readonly portfolioCount: number;
}

export interface AccountSelectOption {
  readonly value: string;
  readonly label: string;
}

export interface AccountPreferencesLabels {
  readonly locale: string;
  readonly theme: string;
  readonly country: string;
  readonly noCountry: string;
  readonly submit: string;
  readonly pending: string;
  readonly saved: string;
}

export interface AccountPreferencesFormProps {
  readonly preferences: AccountPreferences;
  readonly localeOptions: readonly AccountSelectOption[];
  readonly themeOptions: readonly AccountSelectOption[];
  readonly countryOptions: readonly AccountSelectOption[];
  readonly labels: AccountPreferencesLabels;
}

export interface AccountSecuritySession {
  readonly token: string;
  readonly current: boolean;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly userAgent: string | null;
  readonly ipAddress: string | null;
}

export interface AccountProfileFormProps {
  readonly name: string;
  readonly labels: Record<'title' | 'hint' | 'name' | 'submit' | 'pending' | 'saved', string>;
}

export interface AccountSecurityProps {
  readonly email: string;
  readonly emailVerified: boolean;
  readonly sessions: readonly AccountSecuritySession[];
  readonly labels: Record<
    | 'title'
    | 'hint'
    | 'verificationTitle'
    | 'verified'
    | 'unverified'
    | 'resend'
    | 'sending'
    | 'sent'
    | 'passwordTitle'
    | 'currentPassword'
    | 'newPassword'
    | 'showPassword'
    | 'hidePassword'
    | 'changePassword'
    | 'changingPassword'
    | 'passwordChanged'
    | 'sessionsTitle'
    | 'currentSession'
    | 'revoke'
    | 'revoking'
    | 'created'
    | 'expires'
    | 'unknownDevice'
    | 'unknownAddress'
    | 'noSessions',
    string
  >;
}

export interface AccountSessionRowProps {
  readonly session: AccountSecurityProps['sessions'][number];
  readonly current: boolean;
  readonly labels: AccountSecurityProps['labels'];
}
