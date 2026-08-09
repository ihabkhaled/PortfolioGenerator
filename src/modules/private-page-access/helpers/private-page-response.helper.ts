import { DEFAULT_LOCALE, localizePath } from '@/modules/localization';
import { sha256Hex } from '@/packages/cryptography';

import {
  PRIVATE_PAGE_GRANT_MAX_AGE_SECONDS,
  PRIVATE_PAGE_RESPONSE_HEADERS,
} from '../constants/private-page-access.constants';
import type { PrivatePageCookieInput } from '../types/private-page-access.types';

export function buildPrivatePageCookie(input: PrivatePageCookieInput): string {
  const cookieName = buildPrivatePageCookieName(input.scope.portfolioSlug, input.scope.pageId);
  const canonicalPath = `/${encodeURIComponent(input.scope.portfolioSlug)}/${encodeURIComponent(input.scope.pageSlug)}`;
  const path =
    input.scope.locale === DEFAULT_LOCALE
      ? canonicalPath
      : localizePath(canonicalPath, input.scope.locale);
  const attributes = [
    `${cookieName}=${encodeURIComponent(input.grant)}`,
    `Path=${path}`,
    `Max-Age=${input.maxAgeSeconds ?? PRIVATE_PAGE_GRANT_MAX_AGE_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
  ];

  if (input.secure) {
    attributes.push('Secure');
  }

  return attributes.join('; ');
}

export function buildPrivatePageCookieName(portfolioSlug: string, pageId: string): string {
  const suffix = sha256Hex(`${portfolioSlug}\u{0}${pageId}`).slice(0, 20);

  return `pg_private_${suffix}`;
}

export function buildPrivatePageHeaders(): typeof PRIVATE_PAGE_RESPONSE_HEADERS {
  return PRIVATE_PAGE_RESPONSE_HEADERS;
}
