import 'server-only';

import { headers } from 'next/headers';

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
export async function getServerTranslations(
  namespace: I18nNamespace,
  locale?: string,
): Promise<TranslateFunction> {
  let requestLocale = locale ?? 'en';
  if (locale === undefined) {
    try {
      const requestHeaders = await headers();
      requestLocale = requestHeaders.get('x-app-locale') ?? 'en';
    } catch {
      // Static generation and isolated unit tests have no request context.
      // Their canonical language is English, the same as the unprefixed URL.
    }
  }
  return createTranslator(namespace, requestLocale);
}
