'use client';
// client-boundary-reason: useActionState drives the pending flag and the
// two-step (password, then TOTP) form transition; the resolved copy depends
// on the current locale.

import { useActionState, type ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';

import { adminSignInAction, adminVerifyTwoFactorAction } from '../actions/admin-auth.actions';
import { AdminSignInForm } from '../components/admin-sign-in-form.component';
import { ADMIN_SIGN_IN_INITIAL_STATE } from '../constants/admin-auth.constants';
import type { AdminSignInFormState } from '../types/admin-auth-view.types';

export function AdminSignInFormContainer(): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.admin);
  const [state, formAction, isPending] = useActionState(
    (previous: AdminSignInFormState, formData: FormData) =>
      previous.status === 'needs-two-factor'
        ? adminVerifyTwoFactorAction(previous, formData)
        : adminSignInAction(previous, formData),
    ADMIN_SIGN_IN_INITIAL_STATE,
  );

  return (
    <AdminSignInForm
      state={state}
      action={formAction}
      isPending={isPending}
      errorMessage={state.error === null ? null : t(state.error)}
      labels={{
        title: t('signIn.title'),
        lead: t('signIn.lead'),
        emailLabel: t('signIn.emailLabel'),
        passwordLabel: t('signIn.passwordLabel'),
        codeLabel: t('signIn.codeLabel'),
        submitLabel: t('signIn.submitLabel'),
        pendingLabel: t('signIn.pendingLabel'),
      }}
    />
  );
}
