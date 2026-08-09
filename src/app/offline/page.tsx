import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { AppLink } from '@/packages/link';
import { buttonVariants } from '@/packages/ui-primitives';
import { sectionClasses } from '@/shared/components/data-display/section.variants';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OfflinePage(): Promise<ReactElement> {
  const t = await getServerTranslations(I18N_NAMESPACES.errors);

  return (
    <main className={sectionClasses.page}>
      <div className={sectionClasses.pageHeader}>
        <h1 className={sectionClasses.pageTitle}>{t('title')}</h1>
        <p className={sectionClasses.pageLead}>{t('lead')}</p>
        <div className={sectionClasses.pageActions}>
          <AppLink href={ROUTE_PATHS.home} className={buttonVariants({ variant: 'secondary' })}>
            {t('backHome')}
          </AppLink>
        </div>
      </div>
    </main>
  );
}
