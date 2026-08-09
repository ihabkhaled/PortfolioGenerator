import type { ReactNode } from 'react';

import type messages from './messages/en.json';

export type AppMessages = typeof messages;

/** Arbitrarily nested string catalog. */
export interface MessageCatalog {
  [key: string]: string | MessageCatalog;
}

export type TranslateFunction = (
  key: string,
  values?: Readonly<Record<string, string | number>>,
) => string;

export interface I18nLocaleProviderProps {
  readonly locale: string;
  readonly children: ReactNode;
}
