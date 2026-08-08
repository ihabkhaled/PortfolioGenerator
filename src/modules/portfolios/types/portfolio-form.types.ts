export interface PortfolioFormState {
  readonly status: 'idle' | 'error';
  /** A message key inside the `dashboard` namespace, never a raw sentence. */
  readonly error: string | null;
}
