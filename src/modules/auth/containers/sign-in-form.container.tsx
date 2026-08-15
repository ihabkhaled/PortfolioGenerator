'use client';
// client-boundary-reason: useActionState drives the pending flag and the
// server action's returned error, which only exist on the client.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { useAppTranslation, I18N_NAMESPACES } from '@/packages/i18n';
import { AppLink } from '@/packages/link';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { signInAction } from '../actions/auth.actions';
import { CredentialForm } from '../components/credential-form.component';
import { authClasses } from '../constants/auth-style.constants';
import { AUTH_INITIAL_FORM_STATE } from '../constants/auth.constants';
import type { SignInFormContainerProps } from '../types/auth.types';

export function SignInFormContainer(props: SignInFormContainerProps): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.auth);
  const [state, formAction, isPending] = useActionState(signInAction, AUTH_INITIAL_FORM_STATE);
  const noticeMessage =
    state.notice === null ? (props.initialNoticeMessage ?? null) : t(state.notice);

  return (
    <CredentialForm
      includeName={false}
      action={formAction}
      isPending={isPending}
      errorMessage={state.error === null ? null : t(state.error)}
      noticeMessage={noticeMessage}
      submitLabel={t('submitSignIn')}
      pendingLabel={t('pendingSignIn')}
      labels={{
        name: t('nameLabel'),
        email: t('emailLabel'),
        password: t('passwordLabel'),
        passwordHint: t('passwordHint'),
        showPassword: t('showPassword'),
        hidePassword: t('hidePassword'),
      }}
      footer={
        <>
          <AppLink href={{ pathname: '/forgot-password' }} className={authClasses.switchLink}>
            {t('forgotPasswordLink')}
          </AppLink>
          <AppLink href={ROUTE_PATHS.signUp} className={authClasses.switchLink}>
            {t('toSignUp')}
          </AppLink>
        </>
      }
    />
  );
}
