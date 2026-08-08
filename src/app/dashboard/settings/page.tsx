import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import {
  accountClasses,
  AccountSummary,
  DeleteAccountContainer,
} from '@/modules/account/account-ui';
import { requireOwner } from '@/modules/auth/server';
import { listOwnedPortfolios } from '@/modules/portfolios/server';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';

export const metadata: Metadata = {
  title: 'Account',
  robots: { index: false, follow: false },
};

/**
 * Account and data.
 *
 * The retention rules are written on the page rather than buried in a policy
 * document, because the person who needs them is the one standing in front of
 * the delete button.
 */
export default async function AccountSettingsPage(): Promise<ReactElement> {
  const owner = await requireOwner();
  const t = await getServerTranslations(I18N_NAMESPACES.account);
  const portfolios = await listOwnedPortfolios(owner.id);

  return (
    <div className={accountClasses.page}>
      <header className={accountClasses.header}>
        <h1 className={accountClasses.title}>{t('title')}</h1>
        <p className={accountClasses.lead}>{t('lead')}</p>
      </header>

      <AccountSummary
        title={t('summary.title')}
        nameLabel={t('summary.nameLabel')}
        name={owner.name}
        emailLabel={t('summary.emailLabel')}
        email={owner.email}
        portfolioCountLabel={t('summary.portfolioCountLabel')}
        portfolioCount={portfolios.length}
      />

      <section className={accountClasses.section}>
        <h2 className={accountClasses.sectionTitle}>{t('data.title')}</h2>
        <p className={accountClasses.sectionHint}>{t('data.hint')}</p>
        <h3 className={accountClasses.sectionTitle}>{t('data.retentionTitle')}</h3>
        <p className={accountClasses.sectionHint}>{t('data.retention')}</p>
      </section>

      <DeleteAccountContainer />
    </div>
  );
}
