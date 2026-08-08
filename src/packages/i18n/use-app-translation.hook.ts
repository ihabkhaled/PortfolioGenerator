'use client';
// client-boundary-reason: client containers resolve their own copy, and this
// hook is the only sanctioned way for them to reach the catalog.

import { useMemo } from 'react';

import type { I18nNamespace } from './i18n.constants';
import type { TranslateFunction } from './i18n.types';
import { createTranslator } from './translator';

export function useAppTranslation(namespace: I18nNamespace): TranslateFunction {
  return useMemo(() => createTranslator(namespace), [namespace]);
}
