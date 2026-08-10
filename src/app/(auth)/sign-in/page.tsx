import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { authClasses, SignInFormContainer } from '@/modules/auth';
import { redirectIfAuthenticated } from '@/modules/auth/server';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default async function SignInPage(): Promise<ReactElement> {
  await redirectIfAuthenticated();
  const t = await getServerTranslations(I18N_NAMESPACES.auth);

  return (
    <>
      <header className={authClasses.header}>
        <h1 className={authClasses.title}>{t('signInTitle')}</h1>
        <p className={authClasses.lead}>{t('signInLead')}</p>
      </header>
      <SignInFormContainer />
    </>
  );
}
