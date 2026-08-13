import type { ReactElement } from 'react';

import { AppLink, toAppRoute } from '@/packages/link';
import { Badge } from '@/packages/ui-primitives';

import { adminUsersClasses } from '../constants/admin-users-style.constants';
import { ADMIN_TABLE_COLUMN_SCOPE } from '../constants/admin-users.constants';
import type { AdminUserPortfoliosTableProps } from '../types/admin-users-view.types';

/** Every portfolio a user owns — this is the "when we press on user we can see portfolios shared/published/drafts" screen. */
export function AdminUserPortfoliosTable(
  props: Readonly<AdminUserPortfoliosTableProps>,
): ReactElement {
  return (
    <div className={adminUsersClasses.tableWrap}>
      <table className={adminUsersClasses.table}>
        <thead>
          <tr>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminUsersClasses.th}>
              {props.columnLabels.slug}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminUsersClasses.th}>
              {props.columnLabels.status}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminUsersClasses.th}>
              {props.columnLabels.updated}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminUsersClasses.th}>
              {props.columnLabels.links}
            </th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item) => (
            <tr key={item.id}>
              <td className={adminUsersClasses.tdName}>{item.slug}</td>
              <td className={adminUsersClasses.td}>
                <div className={adminUsersClasses.tdActions}>
                  <Badge tone={item.statusBadge.tone}>{item.statusBadge.label}</Badge>
                  {item.suspendedBadge === null ? null : (
                    <Badge tone={item.suspendedBadge.tone}>{item.suspendedBadge.label}</Badge>
                  )}
                </div>
              </td>
              <td className={adminUsersClasses.td}>{item.updatedLabel}</td>
              <td className={adminUsersClasses.td}>
                <div className={adminUsersClasses.tdActions}>
                  <AppLink
                    href={toAppRoute(item.publicHref)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={adminUsersClasses.detailLink}
                  >
                    {item.publicLabel}
                  </AppLink>
                  <AppLink
                    href={toAppRoute(item.adminPortfoliosHref)}
                    className={adminUsersClasses.detailLink}
                  >
                    {item.adminPortfoliosLabel}
                  </AppLink>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
