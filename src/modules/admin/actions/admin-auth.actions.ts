'use server';

import { headers } from 'next/headers';
import QRCode from 'qrcode';

import { getAdminAuth } from '@/packages/admin-auth/server';
import { toAppRoute } from '@/packages/link';
import { logger } from '@/packages/logger';
import { appRedirect } from '@/packages/navigation';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { ADMIN_AUTH_ERROR_KEYS } from '../constants/admin-auth.constants';
import { recordAdminAuditEvent } from '../services/admin-audit.service';
import { getOptionalAdminSession } from '../services/admin-session.service';
import type {
  AdminSignInFormState,
  AdminTwoFactorEnrollment,
} from '../types/admin-auth-view.types';

/**
 * Password step. Two outcomes better-auth itself distinguishes: an ordinary
 * session (no 2FA enrolled yet — the account proceeds to mandatory
 * enrollment) or a `twoFactorRedirect` marker (2FA already enabled — no
 * session cookie is set until `adminVerifyTwoFactorAction` succeeds).
 */
export async function adminSignInAction(
  _previous: AdminSignInFormState,
  formData: FormData,
): Promise<AdminSignInFormState> {
  const email = formData.get('email');
  const password = formData.get('password');

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    email === '' ||
    password === ''
  ) {
    return { status: 'error', error: ADMIN_AUTH_ERROR_KEYS.missingCredentials };
  }

  try {
    const result = await getAdminAuth().api.signInEmail({
      body: { email, password },
      headers: await headers(),
      asResponse: false,
    });

    if ('twoFactorRedirect' in result && result.twoFactorRedirect) {
      return { status: 'needs-two-factor', error: null };
    }
  } catch {
    logger.warn('admin.sign_in.rejected');
    return { status: 'error', error: ADMIN_AUTH_ERROR_KEYS.invalidCredentials };
  }

  const admin = await getOptionalAdminSession();

  if (admin) {
    await recordAdminAuditEvent({
      adminUserId: admin.id,
      targetType: 'ADMIN_USER',
      targetId: admin.id,
      action: 'admin.session.created',
    });
  }

  appRedirect(toAppRoute(ROUTE_PATHS.managawyTwoFactorEnroll));
}

export async function adminVerifyTwoFactorAction(
  _previous: AdminSignInFormState,
  formData: FormData,
): Promise<AdminSignInFormState> {
  const code = formData.get('code');

  if (typeof code !== 'string' || code === '') {
    return { status: 'needs-two-factor', error: ADMIN_AUTH_ERROR_KEYS.missingCode };
  }

  try {
    await getAdminAuth().api.verifyTOTP({ body: { code }, headers: await headers() });
  } catch {
    return { status: 'needs-two-factor', error: ADMIN_AUTH_ERROR_KEYS.invalidCode };
  }

  const admin = await getOptionalAdminSession();

  if (admin) {
    await recordAdminAuditEvent({
      adminUserId: admin.id,
      targetType: 'ADMIN_USER',
      targetId: admin.id,
      action: 'admin.two_factor.verified',
    });
  }

  appRedirect(toAppRoute(ROUTE_PATHS.managawy));
}

/**
 * Starts enrollment: better-auth issues a fresh TOTP secret and backup
 * codes, requiring the current password again as its own confirmation step.
 * Rendered as a `data:` URI PNG server-side — the secret is never sent to
 * any third-party service, only from this server to this admin's own
 * browser, and no raw HTML is ever injected client-side.
 */
export async function adminStartTwoFactorEnrollmentAction(
  password: string,
): Promise<AdminTwoFactorEnrollment> {
  const result = await getAdminAuth().api.enableTwoFactor({
    body: { password, issuer: 'ProFolio Admin' },
    headers: await headers(),
  });
  const qrCodeDataUrl = await QRCode.toDataURL(result.totpURI, { margin: 1 });

  return { totpUri: result.totpURI, qrCodeDataUrl, backupCodes: result.backupCodes };
}

export async function adminConfirmTwoFactorEnrollmentAction(
  _previous: AdminSignInFormState,
  formData: FormData,
): Promise<AdminSignInFormState> {
  const code = formData.get('code');

  if (typeof code !== 'string' || code === '') {
    return { status: 'error', error: ADMIN_AUTH_ERROR_KEYS.missingConfirmCode };
  }

  try {
    await getAdminAuth().api.verifyTOTP({ body: { code }, headers: await headers() });
  } catch {
    return { status: 'error', error: ADMIN_AUTH_ERROR_KEYS.invalidCode };
  }

  const admin = await getOptionalAdminSession();

  if (admin) {
    await recordAdminAuditEvent({
      adminUserId: admin.id,
      targetType: 'ADMIN_USER',
      targetId: admin.id,
      action: 'admin.two_factor.enrolled',
    });
  }

  appRedirect(toAppRoute(ROUTE_PATHS.managawy));
}
