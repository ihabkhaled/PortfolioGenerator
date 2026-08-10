import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { authClasses, PasswordResetRequestContainer } from '@/modules/auth';
import { redirectIfAuthenticated } from '@/modules/auth/server';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';

export const metadata: Metadata = { title: 'Reset password', robots: { index: false } };

export default async function ForgotPasswordPage(): Promise<ReactElement> {
  await redirectIfAuthenticated();
  const t = await getServerTranslations(I18N_NAMESPACES.auth);
  return (
    <>
      <header className={authClasses.header}>
        <h1 className={authClasses.title}>{t('reset.requestTitle')}</h1>
        <p className={authClasses.lead}>{t('reset.requestLead')}</p>
      </header>
      <PasswordResetRequestContainer />
    </>
  );
}
