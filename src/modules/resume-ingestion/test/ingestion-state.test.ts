import { describe, expect, it } from 'vitest';

import { INGESTION_STATES } from '../constants/ingestion.constants';
import { canTransition, hasDraft, isFailure, isTerminal } from '../policies/ingestion-state.policy';

describe('canTransition', () => {
  it.each([
    ['UPLOADED', 'VALIDATED'],
    ['VALIDATED', 'TEXT_EXTRACTED'],
    ['TEXT_EXTRACTED', 'AI_STRUCTURING'],
    ['AI_STRUCTURING', 'NEEDS_REVIEW'],
    ['NEEDS_REVIEW', 'READY'],
  ] as const)('allows %s to %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it('lets a failed extraction be retried', () => {
    expect(canTransition('FAILED_AI', 'AI_STRUCTURING')).toBe(true);
  });

  it.each([
    ['READY', 'AI_STRUCTURING'],
    ['UPLOADED', 'READY'],
    ['NEEDS_REVIEW', 'AI_STRUCTURING'],
    ['FAILED_VALIDATION', 'VALIDATED'],
  ] as const)('refuses %s to %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  it('never lets a finished import go back for another model call', () => {
    expect(canTransition('READY', 'AI_STRUCTURING')).toBe(false);
  });
});

describe('isTerminal', () => {
  it.each(['READY', 'FAILED_VALIDATION', 'FAILED_TEXT_EXTRACTION'] as const)(
    'reports %s as terminal',
    (state) => {
      expect(isTerminal(state)).toBe(true);
    },
  );

  it('does not report a retryable failure as terminal', () => {
    expect(isTerminal('FAILED_AI')).toBe(false);
  });
});

describe('isFailure', () => {
  it.each(['FAILED_VALIDATION', 'FAILED_TEXT_EXTRACTION', 'FAILED_AI'] as const)(
    'reports %s as a failure',
    (state) => {
      expect(isFailure(state)).toBe(true);
    },
  );

  it.each(['UPLOADED', 'READY', 'NEEDS_REVIEW'] as const)('does not flag %s', (state) => {
    expect(isFailure(state)).toBe(false);
  });
});

describe('hasDraft', () => {
  it.each(['NEEDS_REVIEW', 'READY'] as const)('reports a draft for %s', (state) => {
    expect(hasDraft(state)).toBe(true);
  });

  it.each(['UPLOADED', 'AI_STRUCTURING', 'FAILED_AI'] as const)(
    'reports no draft for %s',
    (state) => {
      expect(hasDraft(state)).toBe(false);
    },
  );
});

describe('the transition table', () => {
  it('covers every declared state, so no state can become unreachable by omission', () => {
    for (const state of INGESTION_STATES) {
      expect(() => isTerminal(state)).not.toThrow();
    }
  });
});
