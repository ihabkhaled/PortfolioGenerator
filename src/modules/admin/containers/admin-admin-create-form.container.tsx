'use client';
// client-boundary-reason: useActionState drives the pending/success/error
// state for the create-admin form, and the resolved copy depends on the
// current locale.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';

import { createAdminAdminAction } from '../actions/admin-admins.actions';
import { AdminAdminCreateForm } from '../components/admin-admin-create-form.component';
import { ADMIN_ADMIN_ACTION_INITIAL_STATE } from '../constants/admin-admins.constants';
import { buildAdminAdminRoleOptions } from '../helpers/admin-admins-view.helper';

export function AdminAdminCreateFormContainer(): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.admin);
  const [state, formAction, isPending] = useActionState(
    createAdminAdminAction,
    ADMIN_ADMIN_ACTION_INITIAL_STATE,
  );

  return (
    <AdminAdminCreateForm
      action={formAction}
      isPending={isPending}
      errorMessage={state.status === 'error' && state.message !== null ? t(state.message) : null}
      successMessage={
        state.status === 'success' && state.message !== null ? t(state.message) : null
      }
      roleOptions={buildAdminAdminRoleOptions(t)}
      labels={{
        title: t('admins.create.title'),
        lead: t('admins.create.lead'),
        nameLabel: t('admins.create.nameLabel'),
        emailLabel: t('admins.create.emailLabel'),
        roleLabel: t('admins.create.roleLabel'),
        passwordLabel: t('admins.create.passwordLabel'),
        showPassword: t('admins.create.showPassword'),
        hidePassword: t('admins.create.hidePassword'),
        submitLabel: t('admins.create.submit'),
        pendingLabel: t('admins.create.pending'),
      }}
    />
  );
}
