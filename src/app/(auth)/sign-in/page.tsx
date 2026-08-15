import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { authClasses, AUTH_NOTICE_KEYS, SignInFormContainer } from '@/modules/auth';
import { redirectIfAuthenticated } from '@/modules/auth/server';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';

export const metadata: Metadata = {
  title: 'Sign in',
};

interface SignInPageProps {
  readonly searchParams: Promise<{ readonly notice?: string }>;
}

/**
 * `?notice=verification-email-sent` arrives from a just-completed sign-up
 * that requires email verification — see `signUpAction`. Landing here with
 * the notice already showing is what makes the redirect read as "account
 * created, one more step" instead of the sign-up form silently resetting.
 */
function resolveNoticeKey(notice: string | undefined): string | null {
  return notice === 'verification-email-sent' ? AUTH_NOTICE_KEYS.verificationEmailSent : null;
}

export default async function SignInPage(props: SignInPageProps): Promise<ReactElement> {
  await redirectIfAuthenticated();
  const t = await getServerTranslations(I18N_NAMESPACES.auth);
  const { notice } = await props.searchParams;
  const noticeKey = resolveNoticeKey(notice);

  return (
    <>
      <header className={authClasses.header}>
        <h1 className={authClasses.title}>{t('signInTitle')}</h1>
        <p className={authClasses.lead}>{t('signInLead')}</p>
      </header>
      <SignInFormContainer initialNoticeMessage={noticeKey === null ? null : t(noticeKey)} />
    </>
  );
}
