export type PrivatePageOwnerError = 'invalid-input' | 'not-found' | 'version-conflict';

export interface PrivatePageOwnerActionState {
  readonly status: 'idle' | 'success' | 'error';
  readonly error: PrivatePageOwnerError | null;
  readonly version: number | null;
}

export type PrivatePageOwnerAction = (
  previous: PrivatePageOwnerActionState,
  formData: FormData,
) => Promise<PrivatePageOwnerActionState>;

export interface SetPrivatePageAccessInput {
  readonly ownerId: string;
  readonly portfolioId: string;
  readonly pageId: string;
  readonly expectedVersion: number;
  readonly visibility: 'public' | 'private';
  readonly password: string;
}

export interface PrivatePagePasswordLabels {
  readonly visibility: string;
  readonly publicOption: string;
  readonly privateOption: string;
  readonly password: string;
  readonly passwordHint: string;
  readonly submit: string;
  readonly success: string;
  readonly errors: Readonly<Record<PrivatePageOwnerError, string>>;
}

export interface PrivatePagePasswordContainerProps {
  readonly portfolioId: string;
  readonly pageId: string;
  readonly expectedVersion: number;
  readonly currentVisibility: 'public' | 'private';
  readonly onVersionChange: (version: number) => void;
  readonly labels: PrivatePagePasswordLabels;
}
