/**
 * The message layer's public surface.
 *
 * `useAppTranslation` is safe in client components; `getServerTranslations`
 * (in `./server`) is the async server counterpart. Both resolve from the same
 * catalog, so a key that renders on the server renders identically on the
 * client and hydration cannot mismatch on copy.
 */

export { APP_LOCALE, I18N_NAMESPACES, type I18nNamespace } from './i18n.constants';
export {
  auditCatalogParity,
  auditLocalizedCatalogs,
  createTranslator,
  hasLocalizedMessage,
  hasMatchingInterpolations,
  interpolate,
} from './translator';
export type { CatalogParityIssue } from './translator';
export { useAppTranslation } from './use-app-translation.hook';
export { I18nLocaleProvider } from './locale-context';
export type { AppMessages, MessageCatalog, TranslateFunction } from './i18n.types';
