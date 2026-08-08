import type { DELETION_FAILURES } from '../constants/deletion.constants';

export type DeletionFailure = (typeof DELETION_FAILURES)[keyof typeof DELETION_FAILURES];

/**
 * What a deletion actually removed.
 *
 * Counted and returned rather than logged and forgotten, because "we deleted
 * your CV" is a claim the product makes to a person about their own data, and
 * the only honest way to make it is to have the numbers.
 */
export interface DeletionSummary {
  readonly portfolios: number;
  readonly uploads: number;
  readonly objectsDeleted: number;
  readonly objectsFailed: number;
}

export type DeletionOutcome =
  | { readonly ok: true; readonly summary: DeletionSummary }
  | { readonly ok: false; readonly failure: DeletionFailure };

export interface AccountActionState {
  readonly status: 'idle' | 'error';
  readonly error: string | null;
}
