import { describe, expect, it } from 'vitest';

import {
  ACCOUNT_DELETE_CONFIRMATION,
  accountDeletionSchema,
  portfolioDeletionSchema,
} from '@/modules/account';
import { combineHealth, toHttpStatus, type HealthCheck } from '@/modules/admin-health';
import { isRetryable, shouldEscalate, toAiRunStatus } from '@/modules/ai';
import { signInSchema, signUpSchema } from '@/modules/auth';
import { saveDraftSchema } from '@/modules/portfolio-editor';
import {
  canTransition,
  hasDraft,
  isFailure,
  isTerminal,
  type IngestionState,
} from '@/modules/resume-ingestion';
import { buildStorageKey, isValidStorageKey, randomTokenLength } from '@/modules/storage';
import { parseSchema } from '@/packages/zod';

import { buildFullPortfolioDocument } from '../fixtures/portfolio-document.fixtures';

function check(name: string, state: HealthCheck['state']): HealthCheck {
  return { name, state, latencyMs: 3 };
}

describe('combineHealth', () => {
  it('is ok when every probe answers', () => {
    expect(combineHealth([check('database', 'ok'), check('storage', 'ok')])).toBe('ok');
  });

  // The public read path renders from a JSONB column; a dead bucket breaks
  // imports, not pages, and pulling instances would take the site down for it.
  it('is degraded when only storage is unreachable', () => {
    expect(combineHealth([check('database', 'ok'), check('storage', 'down')])).toBe('degraded');
  });

  it('is down when the database is unreachable', () => {
    expect(combineHealth([check('database', 'down'), check('storage', 'ok')])).toBe('down');
  });

  it('treats a degraded database as down too', () => {
    expect(combineHealth([check('database', 'degraded')])).toBe('down');
  });

  it('is ok with no checks at all rather than inventing a failure', () => {
    expect(combineHealth([])).toBe('ok');
  });
});

describe('toHttpStatus', () => {
  it.each([
    ['ok', 200],
    ['degraded', 200],
    ['down', 503],
  ] as const)('maps %s to %i', (state, status) => {
    expect(toHttpStatus(state)).toBe(status);
  });
});

describe('toAiRunStatus', () => {
  it.each([
    ['invalid-output', 'FAILED_VALIDATION'],
    ['timeout', 'FAILED_TIMEOUT'],
    ['provider-error', 'FAILED_PROVIDER'],
    ['not-configured', 'FAILED_PROVIDER'],
  ] as const)('records %s as %s', (code, status) => {
    expect(toAiRunStatus(code)).toBe(status);
  });
});

describe('isRetryable', () => {
  // A misconfigured provider will not fix itself between two calls.
  it('does not retry a configuration failure', () => {
    expect(isRetryable('not-configured')).toBe(false);
  });

  it.each(['invalid-output', 'timeout', 'provider-error'] as const)('retries %s', (code) => {
    expect(isRetryable(code)).toBe(true);
  });
});

describe('shouldEscalate', () => {
  it('escalates to the stronger model after the schema was missed once', () => {
    expect(shouldEscalate('invalid-output', 1)).toBe(true);
  });

  it('does not escalate on the first attempt', () => {
    expect(shouldEscalate('invalid-output', 0)).toBe(false);
  });

  // A timeout is not a reasoning problem; a costlier model does not fix it.
  it('does not escalate a provider outage', () => {
    expect(shouldEscalate('provider-error', 3)).toBe(false);
  });
});

describe('ingestion state machine', () => {
  it('allows the happy path forward', () => {
    expect(canTransition('UPLOADED', 'VALIDATED')).toBe(true);
  });

  // Moving back into structuring would silently re-bill a model call.
  it('refuses to move a finished upload back into structuring', () => {
    expect(canTransition('READY', 'AI_STRUCTURING')).toBe(false);
  });

  it('treats an unknown state as having no transitions', () => {
    expect(canTransition('NOT_A_STATE' as IngestionState, 'READY')).toBe(false);
    expect(isTerminal('NOT_A_STATE' as IngestionState)).toBe(true);
  });

  it.each(['FAILED_VALIDATION', 'FAILED_TEXT_EXTRACTION', 'FAILED_AI'] as const)(
    'recognises %s as a failure',
    (state) => {
      expect(isFailure(state)).toBe(true);
    },
  );

  it.each(['READY', 'FAILED_VALIDATION', 'FAILED_TEXT_EXTRACTION'] as const)(
    'treats %s as the end of the line',
    (state) => {
      expect(isTerminal(state)).toBe(true);
    },
  );

  // A failed extraction is the one failure worth another attempt: the bytes are
  // already stored and the text already parsed, so a retry costs one model call
  // rather than the whole pipeline.
  it('leaves a failed extraction retryable', () => {
    expect(isTerminal('FAILED_AI')).toBe(false);
    expect(canTransition('FAILED_AI', 'AI_STRUCTURING')).toBe(true);
  });

  it('does not treat a mid-pipeline state as a failure', () => {
    expect(isFailure('AI_STRUCTURING')).toBe(false);
  });

  it.each([
    ['NEEDS_REVIEW', true],
    ['READY', true],
    ['UPLOADED', false],
    ['FAILED_AI', false],
  ] as const)('hasDraft(%s) is %s', (state, expected) => {
    expect(hasDraft(state)).toBe(expected);
  });
});

describe('storage keys', () => {
  it('builds an owner-prefixed key', () => {
    expect(buildStorageKey('owner-1', 'resumes', 'abc123')).toBe('owner-1/resumes/abc123');
  });

  // Defence in depth: a caller passing something odd loses the odd part.
  it('strips anything outside the safe alphabet', () => {
    expect(buildStorageKey('../owner', 'resumes/../..', 'a b')).toBe('owner/resumes/ab');
  });

  it('accepts a key it built and rejects one it did not', () => {
    expect(isValidStorageKey(buildStorageKey('owner-1', 'resumes', 'abc123'))).toBe(true);
    expect(isValidStorageKey('../../etc/passwd')).toBe(false);
    expect(isValidStorageKey('owner-1/resumes')).toBe(false);
  });

  it('reports the token length its callers must generate', () => {
    expect(randomTokenLength()).toBeGreaterThan(0);
    expect(randomTokenLength() % 2).toBe(0);
  });
});

describe('credential schemas', () => {
  it('normalises an address before it reaches the auth library', () => {
    const result = parseSchema(signInSchema, {
      email: '  Amina@Example.COM ',
      password: 'correct horse battery',
    });

    expect(result.ok && result.value.email).toBe('amina@example.com');
  });

  it('reports an invalid address as a message key, not a sentence', () => {
    const result = parseSchema(signInSchema, { email: 'not-an-address', password: 'longenough1' });

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.issues[0]?.message).toBe('errors.invalidEmail');
  });

  it('rejects a short password with the weak-password key', () => {
    const result = parseSchema(signInSchema, { email: 'a@example.com', password: 'short' });

    expect(result.ok ? '' : result.issues[0]?.message).toBe('errors.weakPassword');
  });

  it('requires a name on sign-up', () => {
    const result = parseSchema(signUpSchema, {
      name: ' '.repeat(3),
      email: 'a@example.com',
      password: 'correct horse battery',
    });

    expect(result.ok ? '' : result.issues[0]?.message).toBe('errors.nameRequired');
  });
});

describe('deletion schemas', () => {
  it('accepts a portfolio id', () => {
    expect(parseSchema(portfolioDeletionSchema, { portfolioId: 'p1' }).ok).toBe(true);
  });

  it('rejects an empty portfolio id', () => {
    expect(parseSchema(portfolioDeletionSchema, { portfolioId: '' }).ok).toBe(false);
  });

  // The client check is a courtesy; this one is the guarantee.
  it('requires the exact confirmation word', () => {
    expect(
      parseSchema(accountDeletionSchema, { confirmation: ACCOUNT_DELETE_CONFIRMATION }).ok,
    ).toBe(true);
    expect(parseSchema(accountDeletionSchema, { confirmation: 'delete' }).ok).toBe(false);
    expect(parseSchema(accountDeletionSchema, {}).ok).toBe(false);
  });
});

describe('saveDraftSchema', () => {
  it('accepts a whole valid document with its version', () => {
    const result = parseSchema(saveDraftSchema, {
      portfolioId: 'p1',
      expectedVersion: '3',
      document: buildFullPortfolioDocument(),
    });

    expect(result.ok && result.value.expectedVersion).toBe(3);
  });

  // The editor is a browser, not a trusted client.
  it('rejects a document that does not satisfy the canonical schema', () => {
    const document = buildFullPortfolioDocument();
    const result = parseSchema(saveDraftSchema, {
      portfolioId: 'p1',
      expectedVersion: 1,
      document: { ...document, identity: { ...document.identity, displayName: '' } },
    });

    expect(result.ok).toBe(false);
  });

  it('rejects a version below the first save', () => {
    const result = parseSchema(saveDraftSchema, {
      portfolioId: 'p1',
      expectedVersion: 0,
      document: buildFullPortfolioDocument(),
    });

    expect(result.ok).toBe(false);
  });
});
