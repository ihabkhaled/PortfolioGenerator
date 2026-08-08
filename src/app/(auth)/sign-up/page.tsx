import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { authClasses, SignUpFormContainer } from '@/modules/auth';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';

export const metadata: Metadata = {
  title: 'Create your account',
};

export default async function SignUpPage(): Promise<ReactElement> {
  const t = await getServerTranslations(I18N_NAMESPACES.auth);

  return (
    <>
      <header className={authClasses.header}>
        <h1 className={authClasses.title}>{t('signUpTitle')}</h1>
        <p className={authClasses.lead}>{t('signUpLead')}</p>
      </header>
      <SignUpFormContainer />
    </>
  );
}
