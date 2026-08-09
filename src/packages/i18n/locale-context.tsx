'use client';
// client-boundary-reason: React context carries the server-resolved locale through client subtrees.

import { createContext, useContext } from 'react';
import type { ReactElement } from 'react';

import type { I18nLocaleProviderProps } from './i18n.types';

const LocaleContext = createContext('en');

export function I18nLocaleProvider(props: Readonly<I18nLocaleProviderProps>): ReactElement {
  return <LocaleContext value={props.locale}>{props.children}</LocaleContext>;
}

export function useI18nLocale(): string {
  return useContext(LocaleContext);
}
