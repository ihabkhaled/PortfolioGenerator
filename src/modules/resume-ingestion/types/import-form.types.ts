import type { ExtractionWarning } from './ingestion.types';

export interface ImportFormState {
  readonly status: 'idle' | 'error';
  /** A message key in the `ingestion` namespace, never a raw sentence. */
  readonly error: string | null;
  readonly warnings: readonly ExtractionWarning[];
}
