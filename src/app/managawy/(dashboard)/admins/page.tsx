import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import {
  AdminAdminCreateFormContainer,
  AdminAdminDeleteContainer,
  AdminAdminsTable,
  AdminAdminStatusActionContainer,
  AdminUserSearchForm,
  AdminUsersPagination,
  type AdminAdminListItemView,
} from '@/modules/admin/admin-ui';
import {
  ADMIN_ADMINS_PAGE_PARAM,
  ADMIN_ADMINS_QUERY_PARAM,
  adminAdminsClasses,
  buildAdminAdminRowViews,
  buildAdminAdminsPaginationView,
  buildAdminAdminsResultCountLabel,
  parsePageParam,
  requireAdmin,
  searchAdminAdmins,
} from '@/modules/admin/server';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { EmptyState } from '@/shared/components/feedback/empty-state.component';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

export const metadata: Metadata = {
  title: 'Admins',
  robots: { index: false, follow: false },
};

interface ManagawyAdminsPageProps {
  readonly searchParams: Promise<{ q?: string; page?: string }>;
}

/**
 * Every admin and moderator with access to `/managawy`: searchable,
 * paginated, and the one screen that can create, suspend, activate or delete
 * one. Search + page live in the URL (`?q=&page=`) so the page stays a
 * server component — a GET form writes the query string, this component
 * reads it back, no client fetch in between.
 *
 * Gated on `ADMINS_MANAGE` alone: there is no separate `ADMINS_VIEW`
 * permission, so a role without `ADMINS_MANAGE` (a plain `MODERATOR`, by
 * default) cannot reach this page at all.
 */
export default async function ManagawyAdminsPage(
  props: ManagawyAdminsPageProps,
): Promise<ReactElement> {
  const caller = await requireAdmin('ADMINS_MANAGE');
  const t = await getServerTranslations(I18N_NAMESPACES.admin);

  const searchParams = await props.searchParams;
  const query = searchParams[ADMIN_ADMINS_QUERY_PARAM] ?? '';
  const requestedPage = parsePageParam(searchParams[ADMIN_ADMINS_PAGE_PARAM]);

  const result = await searchAdminAdmins(query, requestedPage);
  const rows = buildAdminAdminRowViews(result.admins, caller.id, t);

  // The super admin and the caller's own row never get mutation controls —
  // `assertNotSuperAdmin`/`assertNotSelfTarget` in the actions enforce both
  // invariants regardless, but there is no reason to hand either row a
  // button that is guaranteed to fail.
  const items: readonly AdminAdminListItemView[] = rows.map((row) => ({
    ...row,
    actions:
      row.isSuperAdmin || row.isSelf ? null : (
        <>
          <AdminAdminStatusActionContainer adminId={row.id} currentStatus={row.status} />
          <AdminAdminDeleteContainer adminId={row.id} />
        </>
      ),
  }));

  return (
    <div className={adminAdminsClasses.page}>
      <header className={adminAdminsClasses.header}>
        <h1 className={adminAdminsClasses.title}>{t('admins.list.title')}</h1>
        <p className={adminAdminsClasses.lead}>{t('admins.list.lead')}</p>
      </header>

      <AdminAdminCreateFormContainer />

      <div className={adminAdminsClasses.toolbar}>
        <AdminUserSearchForm
          action={ROUTE_PATHS.managawyAdmins}
          queryParamName={ADMIN_ADMINS_QUERY_PARAM}
          pageParamName={ADMIN_ADMINS_PAGE_PARAM}
          queryValue={query}
          label={t('admins.list.searchLabel')}
          placeholder={t('admins.list.searchPlaceholder')}
          submitLabel={t('admins.list.searchSubmit')}
        />
        <p className={adminAdminsClasses.resultCount}>
          {buildAdminAdminsResultCountLabel(result, t)}
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={t('admins.list.emptyTitle')}
          description={t(
            query.trim() === ''
              ? 'admins.list.emptyDescription'
              : 'admins.list.emptySearchDescription',
          )}
        />
      ) : (
        <>
          <AdminAdminsTable
            items={items}
            protectedLabel={t('admins.list.protected')}
            selfLabel={t('admins.list.self')}
            columnLabels={{
              name: t('admins.list.columns.name'),
              email: t('admins.list.columns.email'),
              role: t('admins.list.columns.role'),
              status: t('admins.list.columns.status'),
              twoFactor: t('admins.list.columns.twoFactor'),
              joined: t('admins.list.columns.joined'),
              actions: t('admins.list.columns.actions'),
            }}
          />
          <AdminUsersPagination {...buildAdminAdminsPaginationView(result, query, t)} />
        </>
      )}
    </div>
  );
}
