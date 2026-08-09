import type { MessageCatalog, TranslateFunction } from './i18n.types';
import messages from './messages/en.json';
import { launchMarketingMessages } from './messages/launch-marketing';
import localeMessages from './messages/locales.json';

/**
 * The message layer.
 *
 * There is one locale today, so this is deliberately a lookup over a static
 * catalog rather than an i18n framework. The *discipline* is what matters and
 * it is fully intact: every user-visible string is a key, the keys live in one
 * catalog, and the `no-raw-i18n-text` lint rule fails the build if a component
 * inlines copy. Adding locales later replaces the resolver inside this file —
 * which is the entire reason the vendor surface is a wrapper.
 *
 * A missing key returns the key itself rather than throwing. A visibly wrong
 * label is a bug someone reports; a 500 on a published portfolio because a
 * message was renamed is an outage.
 */

const catalog = messages as unknown as MessageCatalog;
const localizedCatalogs = localeMessages as unknown as Readonly<Record<string, MessageCatalog>>;
const launchCatalogs = launchMarketingMessages as unknown as Readonly<
  Record<string, MessageCatalog>
>;

function lookupInCatalog(source: MessageCatalog, path: readonly string[]): string | null {
  let current: unknown = source;

  for (const segment of path) {
    if (typeof current !== 'object' || current === null) {
      return null;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === 'string' ? current : null;
}

function lookup(path: readonly string[], locale: string): string | null {
  const localized = localizedCatalogs[locale];
  const launch = launchCatalogs[locale];
  return (
    (launch === undefined ? null : lookupInCatalog(launch, path)) ??
    (localized === undefined ? null : lookupInCatalog(localized, path)) ??
    lookupInCatalog(catalog, path)
  );
}

export function hasLocalizedMessage(locale: string, namespace: string, key: string): boolean {
  const localized = localizedCatalogs[locale];
  const launch = launchCatalogs[locale];
  const path = [namespace, ...key.split('.')];
  return (
    (launch !== undefined && lookupInCatalog(launch, path) !== null) ||
    (localized !== undefined && lookupInCatalog(localized, path) !== null)
  );
}

/**
 * Replaces `{name}` placeholders with plain text.
 *
 * Written as a single scan with a replacer function rather than a chain of
 * `replaceAll` calls: a value that itself contains `{other}` must not then be
 * treated as a placeholder, and sequential replacement does exactly that.
 */
export function interpolate(
  template: string,
  values: Readonly<Record<string, string | number>> | undefined,
): string {
  if (values === undefined) {
    return template;
  }

  return template.replaceAll(/\{(\w+)\}/gu, (match, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : match,
  );
}

export function createTranslator(namespace: string, locale = 'en'): TranslateFunction {
  return (key, values) => {
    const message = lookup([namespace, ...key.split('.')], locale);

    return message === null ? `${namespace}.${key}` : interpolate(message, values);
  };
}
