import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { requireOwner } from '@/modules/auth/server';
import { getOwnedPortfolio } from '@/modules/portfolios/server';
import {
  ImportFactList,
  importClasses,
  ImportResumeFormContainer,
  type ImportFactRow,
} from '@/modules/resume-ingestion/ingestion-ui';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { appNotFound } from '@/packages/navigation';
import { getUploadLimits } from '@/shared/config/upload-limits';

export const metadata: Metadata = {
  title: 'Import your CV',
  robots: { index: false, follow: false },
};

interface ImportPageProps {
  readonly params: Promise<{ portfolioId: string }>;
}

export default async function ImportPage(props: ImportPageProps): Promise<ReactElement> {
  const owner = await requireOwner();
  const { portfolioId } = await props.params;
  const portfolio = await getOwnedPortfolio(owner.id, portfolioId);

  // Owner-scoped lookup, so another tenant's portfolio id is a 404 rather than
  // a "forbidden" that confirms the id exists.
  if (portfolio === null) {
    appNotFound();
  }

  const t = await getServerTranslations(I18N_NAMESPACES.ingestion);
  const limits = getUploadLimits();

  const facts: readonly ImportFactRow[] = [
    { id: 'privacy', label: t('facts.privacyLabel'), value: t('facts.privacyValue') },
    { id: 'review', label: t('facts.reviewLabel'), value: t('facts.reviewValue') },
    { id: 'accuracy', label: t('facts.accuracyLabel'), value: t('facts.accuracyValue') },
    { id: 'cost', label: t('facts.costLabel'), value: t('facts.costValue') },
  ];

  return (
    <div className={importClasses.page}>
      <header className={importClasses.header}>
        <h1 className={importClasses.title}>{t('title')}</h1>
        <p className={importClasses.lead}>{t('lead')}</p>
      </header>

      <ImportResumeFormContainer
        portfolioId={portfolio.id}
        maxMegabytes={limits.maxMegabytes}
        maxPages={limits.maxPages}
      />

      <ImportFactList facts={facts} />
    </div>
  );
}
