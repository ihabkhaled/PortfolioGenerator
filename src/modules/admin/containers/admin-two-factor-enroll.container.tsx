'use client';
// client-boundary-reason: fetches the enrollment payload (needs the admin's
// password, entered once), drives the confirm-code form's pending state, and
// resolves copy for the current locale.

import { useActionState, useState, type ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button, Input, Label } from '@/packages/ui-primitives';

import {
  adminConfirmTwoFactorEnrollmentAction,
  adminStartTwoFactorEnrollmentAction,
} from '../actions/admin-auth.actions';
import { AdminTwoFactorEnroll } from '../components/admin-two-factor-enroll.component';
import { adminAuthClasses } from '../constants/admin-auth-style.constants';
import { ADMIN_SIGN_IN_INITIAL_STATE } from '../constants/admin-auth.constants';
import type { AdminTwoFactorEnrollment } from '../types/admin-auth-view.types';

export function AdminTwoFactorEnrollContainer(): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.admin);
  const [enrollment, setEnrollment] = useState<AdminTwoFactorEnrollment | null>(null);
  const [password, setPassword] = useState('');
  const [confirmState, confirmAction, isPending] = useActionState(
    adminConfirmTwoFactorEnrollmentAction,
    ADMIN_SIGN_IN_INITIAL_STATE,
  );

  if (enrollment === null) {
    return (
      <div className={adminAuthClasses.page}>
        <div className={adminAuthClasses.header}>
          <h1 className={adminAuthClasses.title}>{t('twoFactor.confirmPasswordTitle')}</h1>
          <p className={adminAuthClasses.lead}>{t('twoFactor.confirmPasswordLead')}</p>
        </div>
        <form
          className={adminAuthClasses.form}
          onSubmit={(event) => {
            event.preventDefault();
            void adminStartTwoFactorEnrollmentAction(password).then(setEnrollment);
          }}
        >
          <div className={adminAuthClasses.field}>
            <Label htmlFor="admin-enroll-password">{t('twoFactor.passwordLabel')}</Label>
            <Input
              id="admin-enroll-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              required
            />
          </div>
          <Button type="submit">{t('twoFactor.continueLabel')}</Button>
        </form>
      </div>
    );
  }

  return (
    <AdminTwoFactorEnroll
      enrollment={enrollment}
      state={confirmState}
      action={confirmAction}
      isPending={isPending}
      errorMessage={confirmState.error === null ? null : t(confirmState.error)}
      labels={{
        enrollTitle: t('twoFactor.enrollTitle'),
        enrollLead: t('twoFactor.enrollLead'),
        qrAlt: t('twoFactor.qrAlt'),
        confirmCodeLabel: t('twoFactor.confirmCodeLabel'),
        submitLabel: t('twoFactor.submitLabel'),
        pendingLabel: t('twoFactor.pendingLabel'),
      }}
    />
  );
}
