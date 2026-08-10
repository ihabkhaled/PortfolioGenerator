'use client';
// client-boundary-reason: useActionState reports submission progress and the enumeration-safe result.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { AppLink } from '@/packages/link';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { requestPasswordResetAction } from '../actions/auth.actions';
import { PasswordRecoveryForm } from '../components/password-recovery-form.component';
import { authClasses } from '../constants/auth-style.constants';
import { PASSWORD_RECOVERY_INITIAL_STATE } from '../constants/auth.constants';

export function PasswordResetRequestContainer(): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.auth);
  const [state, action, isPending] = useActionState(
    requestPasswordResetAction,
    PASSWORD_RECOVERY_INITIAL_STATE,
  );
  return (
    <PasswordRecoveryForm
      mode="request"
      token={null}
      action={action}
      isPending={isPending}
      errorMessage={null}
      successMessage={state.status === 'submitted' ? t('reset.requested') : null}
      emailLabel={t('emailLabel')}
      passwordLabel={t('passwordLabel')}
      passwordHint={t('passwordHint')}
      showPasswordLabel={t('showPassword')}
      hidePasswordLabel={t('hidePassword')}
      submitLabel={t('reset.requestSubmit')}
      pendingLabel={t('reset.requestPending')}
      footer={
        <AppLink href={ROUTE_PATHS.signIn} className={authClasses.switchLink}>
          {t('toSignIn')}
        </AppLink>
      }
    />
  );
}
