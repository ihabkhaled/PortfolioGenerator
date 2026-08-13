import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import {
  AdminPermissionEditorContainer,
  AdminPermissionMatrix,
  AdminRbacPickerTable,
  AdminUserSearchForm,
  AdminUsersPagination,
} from '@/modules/admin/admin-ui';
import {
  ADMIN_RBAC_ADMIN_ID_PARAM,
  ADMIN_RBAC_PAGE_PARAM,
  ADMIN_RBAC_QUERY_PARAM,
  adminRbacClasses,
  buildAdminPermissionMatrixColumns,
  buildAdminPermissionMatrixRows,
  buildAdminRbacListPath,
  buildAdminRbacPaginationView,
  buildAdminRbacPickerRowViews,
  buildAdminRbacResultCountLabel,
  getAdminUserForRbac,
  parsePageParam,
  requireAdmin,
  searchAdminUsersForRbac,
} from '@/modules/admin/server';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { Alert } from '@/packages/ui-primitives';
import { EmptyState } from '@/shared/components/feedback/empty-state.component';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

export const metadata: Metadata = {
  title: 'Permissions (RBAC)',
  robots: { index: false, follow: false },
};

interface ManagawyRbacPageProps {
  readonly searchParams: Promise<{ q?: string; page?: string; adminId?: string }>;
}

/**
 * Two halves under one heading: a read-only reference matrix (what
 * `DEFAULT_ROLE_PERMISSIONS` grants each role, code-defined policy) and a
 * per-admin editor (what one real admin's `AdminUser.permissions` currently
 * holds, and a wholesale-overwrite save). Search, page and the selected
 * admin all live in the URL so the page stays a Server Component and the
 * open editor survives a refresh or a share.
 */
export default async function ManagawyRbacPage(
  props: ManagawyRbacPageProps,
): Promise<ReactElement> {
  const caller = await requireAdmin('RBAC_MANAGE');
  const t = await getServerTranslations(I18N_NAMESPACES.admin);

  const searchParams = await props.searchParams;
  const query = searchParams[ADMIN_RBAC_QUERY_PARAM] ?? '';
  const requestedPage = parsePageParam(searchParams[ADMIN_RBAC_PAGE_PARAM]);
  const rawAdminId = searchParams[ADMIN_RBAC_ADMIN_ID_PARAM];
  const selectedAdminId =
    rawAdminId !== undefined && rawAdminId.trim() !== '' ? rawAdminId.trim() : null;

  const result = await searchAdminUsersForRbac(query, requestedPage);
  const target = selectedAdminId === null ? null : await getAdminUserForRbac(selectedAdminId);

  const pickerItems = buildAdminRbacPickerRowViews(
    result.admins,
    query,
    result.page,
    selectedAdminId,
    t,
  );

  let editorSection: ReactElement;

  if (selectedAdminId === null) {
    editorSection = <Alert tone="info">{t('rbac.editor.notSelectedNotice')}</Alert>;
  } else if (target === null) {
    editorSection = <Alert tone="warning">{t('rbac.editor.notFoundNotice')}</Alert>;
  } else if (target.isSuperAdmin) {
    editorSection = <Alert tone="warning">{t('rbac.editor.superAdminBlockedNotice')}</Alert>;
  } else {
    editorSection = (
      <AdminPermissionEditorContainer
        targetId={target.id}
        targetName={target.name}
        targetEmail={target.email}
        targetRoleLabel={t(`roles.${target.role}`)}
        currentPermissions={target.permissions}
        callerId={caller.id}
        changeAdminHref={buildAdminRbacListPath(query, result.page, null)}
      />
    );
  }

  return (
    <div className={adminRbacClasses.page}>
      <header className={adminRbacClasses.header}>
        <h1 className={adminRbacClasses.title}>{t('rbac.title')}</h1>
        <p className={adminRbacClasses.lead}>{t('rbac.lead')}</p>
      </header>

      <section className={adminRbacClasses.section}>
        <div className={adminRbacClasses.sectionHeader}>
          <h2 className={adminRbacClasses.sectionTitle}>{t('rbac.matrix.title')}</h2>
          <p className={adminRbacClasses.sectionHint}>{t('rbac.matrix.hint')}</p>
        </div>
        <AdminPermissionMatrix
          columns={buildAdminPermissionMatrixColumns(t)}
          rows={buildAdminPermissionMatrixRows(t)}
          columnLabels={{ permission: t('rbac.matrix.permissionColumn') }}
        />
      </section>

      <section className={adminRbacClasses.section}>
        <div className={adminRbacClasses.sectionHeader}>
          <h2 className={adminRbacClasses.sectionTitle}>{t('rbac.picker.title')}</h2>
          <p className={adminRbacClasses.sectionHint}>{t('rbac.picker.hint')}</p>
        </div>

        {editorSection}

        <div className={adminRbacClasses.toolbar}>
          <AdminUserSearchForm
            action={ROUTE_PATHS.managawyRbac}
            queryParamName={ADMIN_RBAC_QUERY_PARAM}
            pageParamName={ADMIN_RBAC_PAGE_PARAM}
            queryValue={query}
            label={t('rbac.picker.searchLabel')}
            placeholder={t('rbac.picker.searchPlaceholder')}
            submitLabel={t('rbac.picker.searchSubmit')}
          />
          <p className={adminRbacClasses.resultCount}>
            {buildAdminRbacResultCountLabel(result, t)}
          </p>
        </div>

        {pickerItems.length === 0 ? (
          <EmptyState
            title={t('rbac.picker.emptyTitle')}
            description={t(
              query.trim() === ''
                ? 'rbac.picker.emptyDescription'
                : 'rbac.picker.emptySearchDescription',
            )}
          />
        ) : (
          <>
            <AdminRbacPickerTable
              items={pickerItems}
              columnLabels={{
                name: t('rbac.picker.columns.name'),
                email: t('rbac.picker.columns.email'),
                role: t('rbac.picker.columns.role'),
                permissions: t('rbac.picker.columns.permissions'),
                actions: t('rbac.picker.columns.actions'),
              }}
            />
            <AdminUsersPagination
              {...buildAdminRbacPaginationView(result, query, selectedAdminId, t)}
            />
          </>
        )}
      </section>
    </div>
  );
}
