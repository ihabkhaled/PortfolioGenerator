import 'server-only';

import type { I18nNamespace } from './i18n.constants';
import type { TranslateFunction } from './i18n.types';
import { createTranslator } from './translator';

/**
 * Server-side translator.
 *
 * Async even though the current lookup is synchronous: when a locale is
 * resolved per request (from the session, or from a portfolio's own content
 * language) this becomes a real await, and every call site is already written
 * for it.
 */
export function getServerTranslations(namespace: I18nNamespace): Promise<TranslateFunction> {
  return Promise.resolve(createTranslator(namespace));
}
