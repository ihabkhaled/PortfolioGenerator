import type { TranslationActionState } from '../types/translation.types';

export const TRANSLATION_ACTION_INITIAL_STATE: TranslationActionState = {
  status: 'idle',
  error: null,
};

export const TRANSLATION_ACTION_FIELDS = {
  portfolioId: 'portfolioId',
  locale: 'locale',
  expectedVersion: 'expectedVersion',
  document: 'document',
} as const;

export const TRANSLATION_ACTION_ERROR_KEY = 'translation.errors.generic';
export const TRANSLATION_QUOTA_ERROR_KEY = 'translation.errors.quotaExceeded';
