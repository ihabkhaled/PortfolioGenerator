export interface AdminSignInFormState {
  readonly status: 'idle' | 'error' | 'needs-two-factor';
  readonly error: string | null;
}

/**
 * The QR code is rendered server-side as a `data:` URI PNG (`QRCode.toDataURL`)
 * and passed straight to an `<img src>` (via `AppImage`) — never as inline SVG
 * markup, so no `dangerouslySetInnerHTML` is needed anywhere in the
 * enrollment UI.
 */
export interface AdminTwoFactorEnrollment {
  readonly totpUri: string;
  readonly qrCodeDataUrl: string;
  readonly backupCodes: readonly string[];
}

export interface AdminSignInFormLabels {
  readonly title: string;
  readonly lead: string;
  readonly emailLabel: string;
  readonly passwordLabel: string;
  readonly codeLabel: string;
  readonly submitLabel: string;
  readonly pendingLabel: string;
}

export interface AdminSignInFormProps {
  readonly state: AdminSignInFormState;
  readonly action: (formData: FormData) => void;
  readonly isPending: boolean;
  readonly errorMessage: string | null;
  readonly labels: AdminSignInFormLabels;
}

export interface AdminTwoFactorEnrollLabels {
  readonly enrollTitle: string;
  readonly enrollLead: string;
  readonly qrAlt: string;
  readonly confirmCodeLabel: string;
  readonly submitLabel: string;
  readonly pendingLabel: string;
}

export interface AdminTwoFactorEnrollProps {
  readonly enrollment: AdminTwoFactorEnrollment;
  readonly state: AdminSignInFormState;
  readonly action: (formData: FormData) => void;
  readonly isPending: boolean;
  readonly errorMessage: string | null;
  readonly labels: AdminTwoFactorEnrollLabels;
}
