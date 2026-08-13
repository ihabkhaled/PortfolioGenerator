import type { ReactElement } from 'react';

import { AppLink, toAppRoute } from '@/packages/link';
import { Badge } from '@/packages/ui-primitives';

import { adminUsersClasses } from '../constants/admin-users-style.constants';
import { ADMIN_TABLE_COLUMN_SCOPE } from '../constants/admin-users.constants';
import type { AdminUsersTableProps } from '../types/admin-users-view.types';

/**
 * The users list, as a real `<table>`: an admin scanning for one account
 * benefits from row/column semantics a screen reader announces for free,
 * and the horizontal scroll on `tableWrap` (see the style constants) keeps
 * seven columns usable on a narrow viewport without collapsing any of them.
 */
export function AdminUsersTable(props: Readonly<AdminUsersTableProps>): ReactElement {
  return (
    <div className={adminUsersClasses.tableWrap}>
      <table className={adminUsersClasses.table}>
        <thead>
          <tr>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminUsersClasses.th}>
              {props.columnLabels.name}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminUsersClasses.th}>
              {props.columnLabels.email}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminUsersClasses.th}>
              {props.columnLabels.verified}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminUsersClasses.th}>
              {props.columnLabels.status}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminUsersClasses.th}>
              {props.columnLabels.portfolios}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminUsersClasses.th}>
              {props.columnLabels.joined}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminUsersClasses.th}>
              {props.columnLabels.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item) => (
            <tr key={item.id}>
              <td className={adminUsersClasses.td}>
                <AppLink
                  href={toAppRoute(item.detailHref)}
                  className={adminUsersClasses.detailLink}
                >
                  {item.name}
                </AppLink>
              </td>
              <td className={adminUsersClasses.td}>{item.email}</td>
              <td className={adminUsersClasses.td}>{item.verifiedLabel}</td>
              <td className={adminUsersClasses.td}>
                <Badge tone={item.statusBadge.tone}>{item.statusBadge.label}</Badge>
              </td>
              <td className={adminUsersClasses.td}>{item.portfolioCountLabel}</td>
              <td className={adminUsersClasses.td}>{item.joinedLabel}</td>
              <td className={adminUsersClasses.td}>
                <div className={adminUsersClasses.tdActions}>{item.actions}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
