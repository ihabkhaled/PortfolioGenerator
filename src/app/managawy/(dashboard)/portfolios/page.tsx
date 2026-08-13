import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import {
  AdminPagination,
  AdminPortfolioDeleteContainer,
  AdminPortfolioFilters,
  AdminPortfolioSuspendToggleContainer,
  AdminPortfolioTable,
} from '@/modules/admin/admin-ui';
import {
  ADMIN_PORTFOLIO_PAGE_SIZE,
  ADMIN_PORTFOLIO_QUERY_PARAMS,
  adminPortfolioClasses,
  buildAdminPortfolioListHref,
  buildAdminPortfolioRowViewData,
  buildAdminPortfolioStatusOptions,
  buildPagination,
  computeOffset,
  listAdminPortfolios,
  parseAdminPortfolioStatusFilter,
  parsePageParam,
  requireAdmin,
  sanitizeAdminPortfolioQuery,
  toAdminPortfolioSummary,
} from '@/modules/admin/server';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { EmptyState } from '@/shared/components/feedback/empty-state.component';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

export const metadata: Metadata = {
  title: 'Portfolios',
  robots: { index: false, follow: false },
};

interface ManagawyPortfoliosPageProps {
  readonly searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

/**
 * Every portfolio, across every owner: search, filter, moderate.
 *
 * Search term, status filter and page all live in the URL query string, so
 * this stays a plain server component — a GET form and links are the entire
 * interaction surface, and a refresh or a shared link reproduces the exact
 * same view.
 */
export default async function ManagawyPortfoliosPage(
  props: ManagawyPortfoliosPageProps,
): Promise<ReactElement> {
  await requireAdmin('PORTFOLIOS_VIEW');
  const t = await getServerTranslations(I18N_NAMESPACES.admin);

  const rawSearchParams = await props.searchParams;
  const query = sanitizeAdminPortfolioQuery(rawSearchParams.q);
  const status = parseAdminPortfolioStatusFilter(rawSearchParams.status);
  const requestedPage = parsePageParam(rawSearchParams.page);

  const { rows, totalCount } = await listAdminPortfolios({
    query,
    status,
    offset: computeOffset(requestedPage, ADMIN_PORTFOLIO_PAGE_SIZE),
    limit: ADMIN_PORTFOLIO_PAGE_SIZE,
  });

  const pagination = buildPagination({
    page: requestedPage,
    pageSize: ADMIN_PORTFOLIO_PAGE_SIZE,
    totalCount,
  });

  const tableRows = rows.map((row) => {
    const view = buildAdminPortfolioRowViewData(toAdminPortfolioSummary(row), t);

    return {
      ...view,
      actions: (
        <>
          <AdminPortfolioSuspendToggleContainer
            portfolioId={view.id}
            isSuspended={view.isSuspended}
          />
          <AdminPortfolioDeleteContainer portfolioId={view.id} />
        </>
      ),
    };
  });

  return (
    <div className={adminPortfolioClasses.page}>
      <header className={adminPortfolioClasses.header}>
        <h1 className={adminPortfolioClasses.title}>{t('portfolios.title')}</h1>
        <p className={adminPortfolioClasses.lead}>{t('portfolios.lead')}</p>
      </header>

      <AdminPortfolioFilters
        action={ROUTE_PATHS.managawyPortfolios}
        queryFieldName={ADMIN_PORTFOLIO_QUERY_PARAMS.query}
        query={query}
        searchLabel={t('portfolios.filters.searchLabel')}
        searchPlaceholder={t('portfolios.filters.searchPlaceholder')}
        statusFieldName={ADMIN_PORTFOLIO_QUERY_PARAMS.status}
        status={status}
        statusLabel={t('portfolios.filters.statusLabel')}
        statusOptions={buildAdminPortfolioStatusOptions(t)}
        submitLabel={t('portfolios.filters.submit')}
      />

      <p className={adminPortfolioClasses.resultSummary}>
        {t('portfolios.resultCount', { count: totalCount })}
      </p>

      {tableRows.length === 0 ? (
        <EmptyState
          title={t('portfolios.empty.title')}
          description={t('portfolios.empty.description')}
        />
      ) : (
        <>
          <AdminPortfolioTable
            rows={tableRows}
            columnLabels={{
              slug: t('portfolios.columns.slug'),
              owner: t('portfolios.columns.owner'),
              status: t('portfolios.columns.status'),
              suspended: t('portfolios.columns.suspended'),
              updated: t('portfolios.columns.updated'),
              actions: t('portfolios.columns.actions'),
            }}
          />
          <AdminPagination
            summaryLabel={t('portfolios.pagination.summary', {
              page: pagination.page,
              pageCount: pagination.pageCount,
            })}
            previousLabel={t('portfolios.pagination.previous')}
            previousHref={
              pagination.hasPrevious
                ? buildAdminPortfolioListHref(query, status, pagination.page - 1)
                : null
            }
            nextLabel={t('portfolios.pagination.next')}
            nextHref={
              pagination.hasNext
                ? buildAdminPortfolioListHref(query, status, pagination.page + 1)
                : null
            }
          />
        </>
      )}
    </div>
  );
}
