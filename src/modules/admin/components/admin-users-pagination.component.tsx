import type { ReactElement } from 'react';

import { AppLink, toAppRoute } from '@/packages/link';
import { buttonVariants, cn } from '@/packages/ui-primitives';

import { adminUsersClasses } from '../constants/admin-users-style.constants';
import type { AdminUsersPaginationProps } from '../types/admin-users-view.types';

const paginationLinkClassName = buttonVariants({ variant: 'secondary', size: 'sm' });
const paginationDisabledClassName = cn(
  paginationLinkClassName,
  adminUsersClasses.paginationDisabled,
);

/**
 * Previous/next only, never a page-number list: offset pagination over a
 * search result does not need jump-to-page, and a `null` href at either
 * boundary renders a disabled control rather than a link to nowhere.
 */
export function AdminUsersPagination(props: Readonly<AdminUsersPaginationProps>): ReactElement {
  return (
    <nav className={adminUsersClasses.pagination} aria-label={props.statusLabel}>
      <span className={adminUsersClasses.paginationStatus}>{props.statusLabel}</span>
      <div className={adminUsersClasses.paginationControls}>
        {props.prevHref === null ? (
          <span className={paginationDisabledClassName} aria-disabled>
            {props.prevLabel}
          </span>
        ) : (
          <AppLink href={toAppRoute(props.prevHref)} className={paginationLinkClassName}>
            {props.prevLabel}
          </AppLink>
        )}
        {props.nextHref === null ? (
          <span className={paginationDisabledClassName} aria-disabled>
            {props.nextLabel}
          </span>
        ) : (
          <AppLink href={toAppRoute(props.nextHref)} className={paginationLinkClassName}>
            {props.nextLabel}
          </AppLink>
        )}
      </div>
    </nav>
  );
}
