import type { ReactNode } from 'react';

export interface PasswordRecoveryFormProps {
  readonly mode: 'request' | 'reset';
  readonly token: string | null;
  readonly action: (formData: FormData) => void;
  readonly isPending: boolean;
  readonly errorMessage: string | null;
  readonly successMessage: string | null;
  readonly emailLabel: string;
  readonly passwordLabel: string;
  readonly passwordHint: string;
  readonly showPasswordLabel: string;
  readonly hidePasswordLabel: string;
  readonly submitLabel: string;
  readonly pendingLabel: string;
  readonly footer: ReactNode;
}

export interface PasswordResetContainerProps {
  readonly token: string | null;
}
