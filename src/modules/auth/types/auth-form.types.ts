import type { ReactNode } from 'react';

export interface AuthFieldLabels {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly passwordHint: string;
}

export interface CredentialFormProps {
  readonly labels: AuthFieldLabels;
  readonly submitLabel: string;
  readonly pendingLabel: string;
  readonly errorMessage: string | null;
  readonly isPending: boolean;
  readonly includeName: boolean;
  readonly action: (formData: FormData) => void;
  readonly footer: ReactNode;
}
