import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { AppLink } from '@/packages/link';
import { buttonVariants } from '@/packages/ui-primitives';
import { sectionClasses } from '@/shared/components/data-display/section.variants';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Also the response for an unpublished or nonexistent portfolio slug. The two
 * are deliberately indistinguishable: a different response for "exists but is
 * a draft" would turn the public router into an enumeration oracle for
 * unpublished work.
 */
export default async function NotFoundPage(): Promise<ReactElement> {
  const t = await getServerTranslations(I18N_NAMESPACES.errors);

  return (
    <main className={sectionClasses.page}>
      <div className={sectionClasses.pageHeader}>
        <h1 className={sectionClasses.pageTitle}>{t('notFoundTitle')}</h1>
        <p className={sectionClasses.pageLead}>{t('notFoundLead')}</p>
        <div className={sectionClasses.pageActions}>
          <AppLink href={ROUTE_PATHS.home} className={buttonVariants({ variant: 'secondary' })}>
            {t('backHome')}
          </AppLink>
        </div>
      </div>
    </main>
  );
}
