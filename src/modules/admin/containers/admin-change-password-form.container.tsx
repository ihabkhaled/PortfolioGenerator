'use client';
// client-boundary-reason: the form tracks an independent pending and success state via useActionState.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button, Label, PasswordInput } from '@/packages/ui-primitives';

import { adminChangePasswordAction } from '../actions/admin-account.actions';
import { adminAccountClasses } from '../constants/admin-account-style.constants';
import {
  ADMIN_ACCOUNT_FIELD_NAMES,
  ADMIN_ACCOUNT_INITIAL_STATE,
} from '../constants/admin-account.constants';

export function AdminChangePasswordFormContainer(): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.admin);
  const [state, formAction, isPending] = useActionState(
    adminChangePasswordAction,
    ADMIN_ACCOUNT_INITIAL_STATE,
  );

  return (
    <section id="change-password" className={adminAccountClasses.section}>
      <h2 className={adminAccountClasses.sectionTitle}>{t('account.security.title')}</h2>
      <p className={adminAccountClasses.sectionHint}>{t('account.security.hint')}</p>
      <form action={formAction} className={adminAccountClasses.field}>
        <Label htmlFor={ADMIN_ACCOUNT_FIELD_NAMES.currentPassword}>
          {t('account.security.currentPassword')}
        </Label>
        <PasswordInput
          id={ADMIN_ACCOUNT_FIELD_NAMES.currentPassword}
          name={ADMIN_ACCOUNT_FIELD_NAMES.currentPassword}
          autoComplete="current-password"
          required
          showLabel={t('account.security.showPassword')}
          hideLabel={t('account.security.hidePassword')}
        />
        <Label htmlFor={ADMIN_ACCOUNT_FIELD_NAMES.newPassword}>
          {t('account.security.newPassword')}
        </Label>
        <PasswordInput
          id={ADMIN_ACCOUNT_FIELD_NAMES.newPassword}
          name={ADMIN_ACCOUNT_FIELD_NAMES.newPassword}
          autoComplete="new-password"
          required
          showLabel={t('account.security.showPassword')}
          hideLabel={t('account.security.hidePassword')}
        />
        {state.status === 'success' ? (
          <p className={adminAccountClasses.sectionHint} role="status">
            {t('account.security.success')}
          </p>
        ) : null}
        {state.status === 'error' && state.error !== null ? (
          <p className={adminAccountClasses.error} role="alert">
            {t(state.error)}
          </p>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {t(isPending ? 'account.security.pending' : 'account.security.submit')}
        </Button>
      </form>
    </section>
  );
}
