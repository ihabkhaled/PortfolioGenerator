import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import {
  AdminUserPortfoliosTable,
  AdminUserProfile,
  AdminUserResetPasswordContainer,
  AdminUserStatusActionContainer,
} from '@/modules/admin/admin-ui';
import {
  adminUsersClasses,
  buildAdminUserPortfolioRowViews,
  buildAdminUserProfileFieldsView,
  getAdminUserDetail,
  listAdminUserPortfolios,
  requireAdmin,
} from '@/modules/admin/server';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { AppLink, toAppRoute } from '@/packages/link';
import { appNotFound } from '@/packages/navigation';
import { EmptyState } from '@/shared/components/feedback/empty-state.component';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

export const metadata: Metadata = {
  title: 'User',
  robots: { index: false, follow: false },
};

interface ManagawyUserDetailPageProps {
  readonly params: Promise<{ userId: string }>;
}

/**
 * One user: their profile, their status, and every portfolio they own — the
 * "when we press on user we can see portfolios shared/published/drafts"
 * screen the owner asked for.
 */
export default async function ManagawyUserDetailPage(
  props: ManagawyUserDetailPageProps,
): Promise<ReactElement> {
  await requireAdmin('USERS_VIEW');
  const t = await getServerTranslations(I18N_NAMESPACES.admin);

  const { userId } = await props.params;
  const user = await getAdminUserDetail(userId);

  // A stale link or a hand-edited URL naming no user is a 404, the same as
  // an owner-scoped lookup elsewhere in the product — there is nothing more
  // specific to tell an admin here.
  if (user === null) {
    appNotFound();
  }

  const portfolios = await listAdminUserPortfolios(userId);
  const portfolioItems = buildAdminUserPortfolioRowViews(portfolios, t);

  return (
    <div className={adminUsersClasses.detailPage}>
      <AppLink href={toAppRoute(ROUTE_PATHS.managawyUsers)} className={adminUsersClasses.backLink}>
        {t('users.detail.backToList')}
      </AppLink>

      <AdminUserProfile
        {...buildAdminUserProfileFieldsView(user, t)}
        statusAction={
          <AdminUserStatusActionContainer userId={user.id} currentStatus={user.status} />
        }
        resetPasswordAction={<AdminUserResetPasswordContainer userId={user.id} />}
      />

      <section className={adminUsersClasses.section}>
        <h2 className={adminUsersClasses.sectionTitle}>{t('users.detail.portfoliosTitle')}</h2>
        {portfolioItems.length === 0 ? (
          <EmptyState
            title={t('users.detail.portfoliosEmptyTitle')}
            description={t('users.detail.portfoliosEmptyDescription')}
          />
        ) : (
          <AdminUserPortfoliosTable
            items={portfolioItems}
            columnLabels={{
              slug: t('users.detail.portfolioColumns.slug'),
              status: t('users.detail.portfolioColumns.status'),
              updated: t('users.detail.portfolioColumns.updated'),
              links: t('users.detail.portfolioColumns.links'),
            }}
          />
        )}
      </section>
    </div>
  );
}
