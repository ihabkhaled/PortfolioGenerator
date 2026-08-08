import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { requireOwner } from '@/modules/auth/server';
import {
  PortfolioEditorContainer,
  PublishPanelContainer,
  editorClasses,
  type EditorLabels,
} from '@/modules/portfolio-editor/editor-ui';
import { getOwnedPortfolio } from '@/modules/portfolios/server';
import { readExtractionWarnings } from '@/modules/resume-ingestion';
import { getLatestOwnedUpload } from '@/modules/resume-ingestion/server';
import { appOrigin } from '@/packages/env';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { appNotFound } from '@/packages/navigation';

export const metadata: Metadata = {
  title: 'Review and edit',
  robots: { index: false, follow: false },
};

interface EditorPageProps {
  readonly params: Promise<{ portfolioId: string }>;
}

export default async function EditorPage(props: EditorPageProps): Promise<ReactElement> {
  const owner = await requireOwner();
  const { portfolioId } = await props.params;
  const portfolio = await getOwnedPortfolio(owner.id, portfolioId);

  if (portfolio === null) {
    appNotFound();
  }

  const t = await getServerTranslations(I18N_NAMESPACES.editor);
  const upload = await getLatestOwnedUpload(owner.id, portfolio.id);

  const labels: EditorLabels = {
    identityTitle: t('identityTitle'),
    identityHint: t('identityHint'),
    displayName: t('displayName'),
    headline: t('headline'),
    summary: t('summary'),
    location: t('location'),
    contactTitle: t('contactTitle'),
    contactHint: t('contactHint'),
    email: t('email'),
    phone: t('phone'),
    showPublicly: t('showPublicly'),
    seoTitle: t('seoTitle'),
    seoHint: t('seoHint'),
    seoTitleField: t('seoTitleField'),
    seoDescriptionField: t('seoDescriptionField'),
    indexable: t('indexable'),
    save: t('save'),
    saving: t('saving'),
    saved: t('saved'),
    unsaved: t('unsaved'),
    warningsTitle: t('warningsTitle'),
  };

  return (
    <>
      <PortfolioEditorContainer
        portfolioId={portfolio.id}
        initialDocument={portfolio.draftDocument}
        initialVersion={portfolio.draftVersion}
        labels={labels}
        warnings={readExtractionWarnings(upload?.warnings)}
      />
      <div className={editorClasses.shell}>
        <PublishPanelContainer
          portfolioId={portfolio.id}
          slug={portfolio.slug}
          isPublished={portfolio.status === 'PUBLISHED'}
          origin={appOrigin}
        />
      </div>
    </>
  );
}
