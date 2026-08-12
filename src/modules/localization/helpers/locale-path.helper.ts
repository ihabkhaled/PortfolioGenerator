import {
  APP_LOCALES,
  DEFAULT_LOCALE,
  PLATFORM_ROUTE_SEGMENTS,
  RTL_LOCALES,
} from '../constants/locale.constants';
import type {
  AppLocale,
  LocaleDirection,
  LocaleRewrite,
  ResolvedLocalePath,
} from '../types/locale.types';

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}

export function isPublicPortfolioCandidatePath(pathname: string): boolean {
  const canonical = resolveLocalePath(pathname).pathname;
  const segments = canonical.split('/').filter(Boolean);
  if (segments[0] === 'portfolios' && segments[1] !== undefined) return true;
  const firstSegment = canonical.split('/').find(Boolean);
  return firstSegment !== undefined && !PLATFORM_ROUTE_SEGMENTS.includes(firstSegment);
}

export function resolveLocalePath(pathname: string): ResolvedLocalePath {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const [first, ...rest] = normalized.slice(1).split('/');

  if (first !== undefined && isAppLocale(first)) {
    const remainder = rest.join('/');
    return {
      locale: first,
      pathname: remainder === '' ? '/' : `/${remainder}`,
      explicit: true,
    };
  }

  return { locale: DEFAULT_LOCALE, pathname: normalized, explicit: false };
}

export function localizePath(pathname: string, locale: AppLocale): string {
  const resolved = resolveLocalePath(pathname);
  return resolved.pathname === '/' ? `/${locale}` : `/${locale}${resolved.pathname}`;
}

/**
 * Platform pages use the unprefixed URL as English's canonical address.
 * Portfolio language switching keeps accepting `/en` for symmetry, but search
 * discovery must not advertise that duplicate for platform-owned content.
 */
export function localizePlatformPath(pathname: string, locale: AppLocale): string {
  const resolved = resolveLocalePath(pathname);

  if (locale === DEFAULT_LOCALE) {
    return resolved.pathname;
  }

  return resolved.pathname === '/' ? `/${locale}` : `/${locale}${resolved.pathname}`;
}

export function getLocaleDirection(locale: AppLocale): LocaleDirection {
  return (RTL_LOCALES as readonly string[]).includes(locale) ? 'rtl' : 'ltr';
}

export function buildLocaleRewrite(pathname: string): LocaleRewrite | null {
  const resolved = resolveLocalePath(pathname);
  return resolved.explicit ? { locale: resolved.locale, pathname: resolved.pathname } : null;
}
