import { isAppLocale } from '@/modules/localization';
import { constantTimeEqual, hmacSha256Base64Url } from '@/packages/cryptography';

import { PRIVATE_PAGE_GRANT_MAX_AGE_SECONDS } from '../constants/private-page-access.constants';
import type {
  PrivatePageGrantInput,
  PrivatePageGrantPayload,
  PrivatePageGrantVerificationInput,
} from '../types/private-page-access.types';

export function createPrivatePageGrant(input: PrivatePageGrantInput): string {
  const nowSeconds = Math.floor((input.now ?? new Date()).getTime() / 1000);
  const payload: PrivatePageGrantPayload = {
    ...input.scope,
    expiresAt: nowSeconds + (input.maxAgeSeconds ?? PRIVATE_PAGE_GRANT_MAX_AGE_SECONDS),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  return `${encodedPayload}.${signPrivatePageGrant(encodedPayload, input.secret)}`;
}

export function verifyPrivatePageGrant(input: PrivatePageGrantVerificationInput): boolean {
  const [encodedPayload, suppliedSignature, extra] = input.grant.split('.', 3);

  if (!encodedPayload || !suppliedSignature || extra !== undefined) {
    return false;
  }

  const expectedSignature = signPrivatePageGrant(encodedPayload, input.secret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);

  if (!constantTimeEqual(supplied, expected)) {
    return false;
  }

  const payload = readPrivatePageGrantPayload(encodedPayload);
  const nowSeconds = Math.floor((input.now ?? new Date()).getTime() / 1000);

  return (
    payload !== null &&
    payload.expiresAt >= nowSeconds &&
    payload.portfolioSlug === input.scope.portfolioSlug &&
    payload.pageId === input.scope.pageId &&
    payload.pageSlug === input.scope.pageSlug &&
    payload.locale === input.scope.locale
  );
}

export function signPrivatePageGrant(payload: string, secret: string): string {
  return hmacSha256Base64Url(payload, secret);
}

export function readPrivatePageGrantPayload(
  encodedPayload: string,
): PrivatePageGrantPayload | null {
  try {
    const value: unknown = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));

    if (
      typeof value !== 'object' ||
      value === null ||
      !('portfolioSlug' in value) ||
      !('pageId' in value) ||
      !('pageSlug' in value) ||
      !('locale' in value) ||
      !('expiresAt' in value) ||
      typeof value.portfolioSlug !== 'string' ||
      typeof value.pageId !== 'string' ||
      typeof value.pageSlug !== 'string' ||
      typeof value.expiresAt !== 'number' ||
      typeof value.locale !== 'string' ||
      !isAppLocale(value.locale)
    ) {
      return null;
    }

    return value as PrivatePageGrantPayload;
  } catch {
    return null;
  }
}
