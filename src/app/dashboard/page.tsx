import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { requireOwner } from '@/modules/auth/server';
import {
  buildPortfolioListItems,
  CreatePortfolioFormContainer,
  dashboardClasses,
  PortfolioList,
  type PortfolioListItem,
} from '@/modules/portfolios/dashboard';
import { listOwnedPortfolios } from '@/modules/portfolios/server';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { AppLink, toAppRoute } from '@/packages/link';
import { buttonVariants } from '@/packages/ui-primitives';
import { EmptyState } from '@/shared/components/feedback/empty-state.component';
import {
  buildDashboardEditorPath,
  buildDashboardImportPath,
  buildPortfolioPath,
} from '@/shared/constants/route-paths.constants';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage(): Promise<ReactElement> {
  const owner = await requireOwner();
  const t = await getServerTranslations(I18N_NAMESPACES.dashboard);
  const portfolios = await listOwnedPortfolios(owner.id);

  const items: readonly PortfolioListItem[] = buildPortfolioListItems(portfolios, t).map(
    (item) => ({
      ...item,
      actions: (
        <>
          <AppLink
            href={toAppRoute(buildDashboardImportPath(item.id))}
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            {t('actions.import')}
          </AppLink>
          <AppLink
            href={toAppRoute(buildDashboardEditorPath(item.id))}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            {t('actions.edit')}
          </AppLink>
          {item.isPublished ? (
            <AppLink
              href={toAppRoute(buildPortfolioPath(item.slug))}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              {t('actions.view')}
            </AppLink>
          ) : null}
        </>
      ),
    }),
  );

  return (
    <div className={dashboardClasses.page}>
      <header className={dashboardClasses.header}>
        <h1 className={dashboardClasses.title}>{t('title')}</h1>
        <p className={dashboardClasses.lead}>{t('lead')}</p>
      </header>

      <CreatePortfolioFormContainer />

      <section className={dashboardClasses.listSection}>
        <h2 className={dashboardClasses.sectionTitle}>{t('listTitle')}</h2>
        {items.length === 0 ? (
          <EmptyState title={t('empty.title')} description={t('empty.description')} />
        ) : (
          <PortfolioList items={items} />
        )}
      </section>
    </div>
  );
}
