import type { ReactElement } from 'react';

import { AppLink, toAppRoute } from '@/packages/link';

import { adminPortfolioClasses } from '../constants/admin-portfolio-style.constants';
import type { AdminPaginationProps } from '../types/admin-portfolio-view.types';

/**
 * Previous/next controls, disabled at the boundaries.
 *
 * A `null` href renders a plain, `aria-disabled` span rather than a link with
 * a handler that does nothing — the boundary is real, not merely styled.
 */
export function AdminPagination(props: Readonly<AdminPaginationProps>): ReactElement {
  return (
    <nav className={adminPortfolioClasses.pagination} aria-label={props.summaryLabel}>
      <span className={adminPortfolioClasses.paginationSummary}>{props.summaryLabel}</span>
      <div className={adminPortfolioClasses.paginationControls}>
        {props.previousHref === null ? (
          <span className={adminPortfolioClasses.paginationDisabled} aria-disabled>
            {props.previousLabel}
          </span>
        ) : (
          <AppLink
            href={toAppRoute(props.previousHref)}
            className={adminPortfolioClasses.paginationLink}
          >
            {props.previousLabel}
          </AppLink>
        )}
        {props.nextHref === null ? (
          <span className={adminPortfolioClasses.paginationDisabled} aria-disabled>
            {props.nextLabel}
          </span>
        ) : (
          <AppLink
            href={toAppRoute(props.nextHref)}
            className={adminPortfolioClasses.paginationLink}
          >
            {props.nextLabel}
          </AppLink>
        )}
      </div>
    </nav>
  );
}
