import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { authClasses, PasswordResetContainer } from '@/modules/auth';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';

export const metadata: Metadata = { title: 'Choose a new password', robots: { index: false } };

export default async function ResetPasswordPage(props: {
  readonly searchParams: Promise<{ token?: string }>;
}): Promise<ReactElement> {
  const t = await getServerTranslations(I18N_NAMESPACES.auth);
  const { token } = await props.searchParams;
  return (
    <>
      <header className={authClasses.header}>
        <h1 className={authClasses.title}>{t('reset.resetTitle')}</h1>
        <p className={authClasses.lead}>{t('reset.resetLead')}</p>
      </header>
      <PasswordResetContainer token={token ?? null} />
    </>
  );
}
