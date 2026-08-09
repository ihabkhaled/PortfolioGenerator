'use client';
// client-boundary-reason: useActionState reports reset progress and token-consumption errors.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';

import { resetPasswordAction } from '../actions/auth.actions';
import { PasswordRecoveryForm } from '../components/password-recovery-form.component';
import { PASSWORD_RECOVERY_INITIAL_STATE } from '../constants/auth.constants';
import type { PasswordResetContainerProps } from '../types/password-recovery-form.types';

export function PasswordResetContainer(props: Readonly<PasswordResetContainerProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.auth);
  const [state, action, isPending] = useActionState(
    resetPasswordAction,
    PASSWORD_RECOVERY_INITIAL_STATE,
  );
  return (
    <PasswordRecoveryForm
      mode="reset"
      token={props.token}
      action={action}
      isPending={isPending}
      errorMessage={state.status === 'error' ? t('errors.unknown') : null}
      successMessage={state.status === 'success' ? t('reset.completed') : null}
      emailLabel={t('emailLabel')}
      passwordLabel={t('reset.newPassword')}
      passwordHint={t('passwordHint')}
      submitLabel={t('reset.resetSubmit')}
      pendingLabel={t('reset.resetPending')}
    />
  );
}
