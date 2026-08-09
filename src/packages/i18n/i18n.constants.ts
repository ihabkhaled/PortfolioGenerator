/** The platform UI locale. Portfolio *content* language is per-tenant data. */
export const APP_LOCALE = 'en';

/** Message namespaces, so a typo in a namespace is a type error, not a blank string. */
export const I18N_NAMESPACES = {
  account: 'account',
  app: 'app',
  auth: 'auth',
  contact: 'contact',
  dashboard: 'dashboard',
  editor: 'editor',
  ingestion: 'ingestion',
  publishing: 'publishing',
  portfolio: 'portfolio',
  errors: 'errors',
  marketing: 'marketing',
  localization: 'localization',
} as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[keyof typeof I18N_NAMESPACES];
