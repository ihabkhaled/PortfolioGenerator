import type { MessageCatalog, TranslateFunction } from './i18n.types';
import messages from './messages/en.json';
import { launchMarketingMessages } from './messages/launch-marketing';
import arMessages from './messages/locales/ar.json';
import deMessages from './messages/locales/de.json';
import esMessages from './messages/locales/es.json';
import faMessages from './messages/locales/fa.json';
import frMessages from './messages/locales/fr.json';
import hiMessages from './messages/locales/hi.json';
import itMessages from './messages/locales/it.json';
import jaMessages from './messages/locales/ja.json';
import ptMessages from './messages/locales/pt.json';
import ruMessages from './messages/locales/ru.json';
import thMessages from './messages/locales/th.json';
import zhMessages from './messages/locales/zh.json';

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
const localizedCatalogs: Readonly<Record<string, MessageCatalog>> = {
  ar: arMessages,
  de: deMessages,
  es: esMessages,
  fa: faMessages,
  fr: frMessages,
  hi: hiMessages,
  it: itMessages,
  ja: jaMessages,
  pt: ptMessages,
  ru: ruMessages,
  th: thMessages,
  zh: zhMessages,
};
const launchCatalogs = launchMarketingMessages as unknown as Readonly<
  Record<string, MessageCatalog>
>;

export interface CatalogParityIssue {
  readonly locale: string;
  readonly key: string;
  readonly reason: 'missing' | 'interpolation-mismatch';
}

function auditFlattenedCatalogs(
  english: Readonly<Record<string, string>>,
  localized: Readonly<Record<string, string>>,
  locale: string,
  excludedNamespaces: readonly string[] = [],
): readonly CatalogParityIssue[] {
  const excludedPrefixes = excludedNamespaces.map((namespace) => `${namespace}.`);
  return Object.entries(english).flatMap<CatalogParityIssue>(([key, value]) => {
    if (excludedPrefixes.some((prefix) => key.startsWith(prefix))) return [];
    const localizedValue = localized[key];
    if (localizedValue === undefined) return [{ locale, key, reason: 'missing' }];
    return hasMatchingInterpolations(localizedValue, value)
      ? []
      : [{ locale, key, reason: 'interpolation-mismatch' }];
  });
}

function flattenCatalog(source: MessageCatalog, prefix = ''): Readonly<Record<string, string>> {
  const entries: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (typeof value === 'string') entries[path] = value;
    else {
      Object.assign(entries, flattenCatalog(value, path));
    }
  }
  return entries;
}

function interpolationNames(value: string): readonly string[] {
  return value
    .matchAll(/\{\w+\}/gu)
    .map((match) => match[0].slice(1, -1))
    .toArray();
}

export function hasMatchingInterpolations(left: string, right: string): boolean {
  const leftNames = interpolationNames(left);
  const unmatchedRightNames = [...interpolationNames(right)];
  if (leftNames.length !== unmatchedRightNames.length) return false;
  return leftNames.every((name) => {
    const matchIndex = unmatchedRightNames.indexOf(name);
    if (matchIndex === -1) return false;
    unmatchedRightNames.splice(matchIndex, 1);
    return true;
  });
}

/** Reports every missing key and placeholder-contract mismatch without English fallback. */
export function auditLocalizedCatalogs(locales: readonly string[]): readonly CatalogParityIssue[] {
  // `/managawy` is an isolated, English-only operational surface. Its partial
  // legacy translations must not make the public-locale completeness gate
  // require every new admin capability in every customer-facing language.
  const english = flattenCatalog(catalog);
  return locales.flatMap<CatalogParityIssue>((locale) => {
    const combined = {
      ...flattenCatalog(localizedCatalogs[locale] ?? {}),
      ...flattenCatalog(launchCatalogs[locale] ?? {}),
    };
    return auditFlattenedCatalogs(english, combined, locale, ['admin']);
  });
}

export function auditCatalogParity(
  english: MessageCatalog,
  localized: MessageCatalog,
  locale: string,
  excludedNamespaces: readonly string[] = [],
): readonly CatalogParityIssue[] {
  return auditFlattenedCatalogs(
    flattenCatalog(english),
    flattenCatalog(localized),
    locale,
    excludedNamespaces,
  );
}

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
