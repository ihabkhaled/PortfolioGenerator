'use client';
// client-boundary-reason: useActionState drives the pending flag and the
// server action's returned error, which only exist on the client.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { useAppTranslation, I18N_NAMESPACES } from '@/packages/i18n';
import { AppLink } from '@/packages/link';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { signUpAction } from '../actions/auth.actions';
import { CredentialForm } from '../components/credential-form.component';
import { authClasses } from '../constants/auth-style.constants';
import { AUTH_INITIAL_FORM_STATE } from '../constants/auth.constants';

export function SignUpFormContainer(): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.auth);
  const [state, formAction, isPending] = useActionState(signUpAction, AUTH_INITIAL_FORM_STATE);

  return (
    <CredentialForm
      includeName
      action={formAction}
      isPending={isPending}
      errorMessage={state.error === null ? null : t(state.error)}
      submitLabel={t('submitSignUp')}
      pendingLabel={t('pendingSignUp')}
      labels={{
        name: t('nameLabel'),
        email: t('emailLabel'),
        password: t('passwordLabel'),
        passwordHint: t('passwordHint'),
      }}
      footer={
        <AppLink href={ROUTE_PATHS.signIn} className={authClasses.switchLink}>
          {t('toSignIn')}
        </AppLink>
      }
    />
  );
}
