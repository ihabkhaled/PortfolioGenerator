import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import {
  AdminAuditLogFilters,
  AdminAuditLogTable,
  AdminPagination,
} from '@/modules/admin/admin-ui';
import {
  ADMIN_AUDIT_LOG_ALL_VALUE,
  ADMIN_AUDIT_LOG_PAGE_SIZE,
  ADMIN_AUDIT_LOG_QUERY_PARAMS,
  adminAuditLogClasses,
  buildAdminAuditLogAdminOptions,
  buildAdminAuditLogActionOptions,
  buildAdminAuditLogListHref,
  buildAdminAuditLogRowView,
  buildAdminAuditLogTargetTypeOptions,
  buildPagination,
  computeOffset,
  getAdminAuditLogFilterOptions,
  listAdminAuditEvents,
  parseAdminAuditLogTargetTypeFilter,
  parsePageParam,
  requireAdmin,
  sanitizeAdminAuditLogFilterValue,
  sanitizeAdminAuditLogQuery,
  toAdminAuditEventSummary,
  type AdminAuditLogFilterState,
} from '@/modules/admin/server';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { EmptyState } from '@/shared/components/feedback/empty-state.component';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

export const metadata: Metadata = {
  title: 'Audit log',
  robots: { index: false, follow: false },
};

interface ManagawyAuditLogPageProps {
  readonly searchParams: Promise<{
    q?: string;
    admin?: string;
    targetType?: string;
    action?: string;
    page?: string;
  }>;
}

/**
 * Who did what to whom, reverse-chronological, across every acting admin.
 *
 * Strictly read-only: this page renders `AdminAuditEvent` rows and offers no
 * mutation of any kind — an audit trail that can be edited or deleted from
 * its own viewer is worthless as a record. Search term, every filter and the
 * page number all live in the URL query string, so this stays a plain Server
 * Component: a GET form and links are the entire interaction surface, and a
 * refresh or a shared link reproduces the exact same view.
 *
 * `AUDIT_VIEW` is not part of `DEFAULT_ROLE_PERMISSIONS.MODERATOR` — a
 * moderator reaching this URL gets `requireAdmin`'s thrown error, same as
 * any other admin missing a permission the UI should never have offered.
 */
export default async function ManagawyAuditLogPage(
  props: ManagawyAuditLogPageProps,
): Promise<ReactElement> {
  await requireAdmin('AUDIT_VIEW');
  const t = await getServerTranslations(I18N_NAMESPACES.admin);

  const rawSearchParams = await props.searchParams;
  const query = sanitizeAdminAuditLogQuery(rawSearchParams.q);
  const adminUserId = sanitizeAdminAuditLogFilterValue(rawSearchParams.admin);
  const targetType = parseAdminAuditLogTargetTypeFilter(rawSearchParams.targetType);
  const action = sanitizeAdminAuditLogFilterValue(rawSearchParams.action);
  const requestedPage = parsePageParam(rawSearchParams.page);
  const filters: AdminAuditLogFilterState = { query, adminUserId, targetType, action };

  const filterOptions = await getAdminAuditLogFilterOptions();

  const { rows, totalCount } = await listAdminAuditEvents({
    ...filters,
    offset: computeOffset(requestedPage, ADMIN_AUDIT_LOG_PAGE_SIZE),
    limit: ADMIN_AUDIT_LOG_PAGE_SIZE,
  });

  const pagination = buildPagination({
    page: requestedPage,
    pageSize: ADMIN_AUDIT_LOG_PAGE_SIZE,
    totalCount,
  });

  const tableRows = rows.map((row) => buildAdminAuditLogRowView(toAdminAuditEventSummary(row), t));

  return (
    <div className={adminAuditLogClasses.page}>
      <header className={adminAuditLogClasses.header}>
        <h1 className={adminAuditLogClasses.title}>{t('auditLog.title')}</h1>
        <p className={adminAuditLogClasses.lead}>{t('auditLog.lead')}</p>
      </header>

      <AdminAuditLogFilters
        action={ROUTE_PATHS.managawyAuditLog}
        queryFieldName={ADMIN_AUDIT_LOG_QUERY_PARAMS.query}
        query={query}
        searchLabel={t('auditLog.filters.searchLabel')}
        searchPlaceholder={t('auditLog.filters.searchPlaceholder')}
        adminFieldName={ADMIN_AUDIT_LOG_QUERY_PARAMS.admin}
        adminValue={adminUserId ?? ADMIN_AUDIT_LOG_ALL_VALUE}
        adminLabel={t('auditLog.filters.adminLabel')}
        adminOptions={buildAdminAuditLogAdminOptions(filterOptions.admins, t)}
        targetTypeFieldName={ADMIN_AUDIT_LOG_QUERY_PARAMS.targetType}
        targetTypeValue={targetType}
        targetTypeLabel={t('auditLog.filters.targetTypeLabel')}
        targetTypeOptions={buildAdminAuditLogTargetTypeOptions(t)}
        actionFieldName={ADMIN_AUDIT_LOG_QUERY_PARAMS.action}
        actionValue={action ?? ADMIN_AUDIT_LOG_ALL_VALUE}
        actionLabel={t('auditLog.filters.actionLabel')}
        actionOptions={buildAdminAuditLogActionOptions(filterOptions.actions, t)}
        submitLabel={t('auditLog.filters.submit')}
      />

      <p className={adminAuditLogClasses.resultSummary}>
        {t('auditLog.resultCount', { count: totalCount })}
      </p>

      {tableRows.length === 0 ? (
        <EmptyState
          title={t('auditLog.empty.title')}
          description={t('auditLog.empty.description')}
        />
      ) : (
        <>
          <AdminAuditLogTable
            rows={tableRows}
            columnLabels={{
              when: t('auditLog.columns.when'),
              admin: t('auditLog.columns.admin'),
              action: t('auditLog.columns.action'),
              targetType: t('auditLog.columns.targetType'),
              targetId: t('auditLog.columns.targetId'),
              metadata: t('auditLog.columns.metadata'),
            }}
            metadataEmptyLabel={t('auditLog.metadataEmpty')}
          />
          <AdminPagination
            summaryLabel={t('auditLog.pagination.summary', {
              page: pagination.page,
              pageCount: pagination.pageCount,
            })}
            previousLabel={t('auditLog.pagination.previous')}
            previousHref={
              pagination.hasPrevious
                ? buildAdminAuditLogListHref(filters, pagination.page - 1)
                : null
            }
            nextLabel={t('auditLog.pagination.next')}
            nextHref={
              pagination.hasNext ? buildAdminAuditLogListHref(filters, pagination.page + 1) : null
            }
          />
        </>
      )}
    </div>
  );
}
