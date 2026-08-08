import { INGESTION_TRANSITIONS } from '../constants/ingestion.constants';
import type { IngestionState } from '../types/ingestion.types';

/**
 * The ingestion state machine.
 *
 * State is persisted, so a user who refreshes mid-import sees where their
 * upload actually is rather than a spinner that has forgotten. Transitions are
 * checked rather than assumed: a bug that moves an upload from `READY` back to
 * `AI_STRUCTURING` would silently re-bill a model call, and this is where that
 * stops.
 */

export function canTransition(from: IngestionState, to: IngestionState): boolean {
  return (INGESTION_TRANSITIONS[from] ?? []).includes(to);
}

export function isTerminal(state: IngestionState): boolean {
  return (INGESTION_TRANSITIONS[state] ?? []).length === 0;
}

export function isFailure(state: IngestionState): boolean {
  return state.startsWith('FAILED_');
}

/**
 * Whether a draft exists for this upload. `NEEDS_REVIEW` and `READY` both have
 * one — the difference is whether the user has looked at the warnings yet.
 */
export function hasDraft(state: IngestionState): boolean {
  return state === 'NEEDS_REVIEW' || state === 'READY';
}
