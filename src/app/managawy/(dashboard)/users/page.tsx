import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import {
  AdminUserResetPasswordContainer,
  AdminUserSearchForm,
  AdminUsersPagination,
  AdminUsersTable,
  AdminUserStatusActionContainer,
  type AdminUserListItemView,
} from '@/modules/admin/admin-ui';
import {
  ADMIN_USERS_PAGE_PARAM,
  ADMIN_USERS_QUERY_PARAM,
  adminUsersClasses,
  buildAdminUserRowViews,
  buildAdminUsersPaginationView,
  buildAdminUsersResultCountLabel,
  parsePageParam,
  requireAdmin,
  searchAdminUsers,
} from '@/modules/admin/server';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { EmptyState } from '@/shared/components/feedback/empty-state.component';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

export const metadata: Metadata = {
  title: 'Users',
  robots: { index: false, follow: false },
};

interface ManagawyUsersPageProps {
  readonly searchParams: Promise<{ q?: string; page?: string }>;
}

/**
 * Every platform user, searchable and paginated. Search + page live in the
 * URL (`?q=&page=`) so the page stays a plain Server Component: a GET form
 * writes the query string, this component reads it back, no client fetch in
 * between.
 */
export default async function ManagawyUsersPage(
  props: ManagawyUsersPageProps,
): Promise<ReactElement> {
  await requireAdmin('USERS_VIEW');
  const t = await getServerTranslations(I18N_NAMESPACES.admin);

  const searchParams = await props.searchParams;
  const query = searchParams[ADMIN_USERS_QUERY_PARAM] ?? '';
  const requestedPage = parsePageParam(searchParams[ADMIN_USERS_PAGE_PARAM]);

  const result = await searchAdminUsers(query, requestedPage);
  const rows = buildAdminUserRowViews(result.users, t);
  const items: readonly AdminUserListItemView[] = rows.map((row) => ({
    ...row,
    actions: (
      <>
        <AdminUserStatusActionContainer userId={row.id} currentStatus={row.status} />
        <AdminUserResetPasswordContainer userId={row.id} />
      </>
    ),
  }));

  return (
    <div className={adminUsersClasses.page}>
      <header className={adminUsersClasses.header}>
        <h1 className={adminUsersClasses.title}>{t('users.list.title')}</h1>
        <p className={adminUsersClasses.lead}>{t('users.list.lead')}</p>
      </header>

      <div className={adminUsersClasses.toolbar}>
        <AdminUserSearchForm
          action={ROUTE_PATHS.managawyUsers}
          queryParamName={ADMIN_USERS_QUERY_PARAM}
          pageParamName={ADMIN_USERS_PAGE_PARAM}
          queryValue={query}
          label={t('users.list.searchLabel')}
          placeholder={t('users.list.searchPlaceholder')}
          submitLabel={t('users.list.searchSubmit')}
        />
        <p className={adminUsersClasses.resultCount}>
          {buildAdminUsersResultCountLabel(result, t)}
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={t('users.list.emptyTitle')}
          description={t(
            query.trim() === ''
              ? 'users.list.emptyDescription'
              : 'users.list.emptySearchDescription',
          )}
        />
      ) : (
        <>
          <AdminUsersTable
            items={items}
            columnLabels={{
              name: t('users.list.columns.name'),
              email: t('users.list.columns.email'),
              verified: t('users.list.columns.verified'),
              status: t('users.list.columns.status'),
              portfolios: t('users.list.columns.portfolios'),
              joined: t('users.list.columns.joined'),
              actions: t('users.list.columns.actions'),
            }}
          />
          <AdminUsersPagination {...buildAdminUsersPaginationView(result, query, t)} />
        </>
      )}
    </div>
  );
}
