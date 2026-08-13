import type { ReactElement } from 'react';

import { Badge } from '@/packages/ui-primitives';

import { adminAdminsClasses } from '../constants/admin-admins-style.constants';
import { ADMIN_TABLE_COLUMN_SCOPE } from '../constants/admin-users.constants';
import type { AdminAdminsTableProps } from '../types/admin-admins-view.types';

/**
 * The admins list, as a real `<table>` — mirrors `AdminUsersTable`. The
 * super admin's row carries a "Protected" badge next to its name and the
 * caller's own row carries a "This is you" badge, both computed upstream on
 * the page: this component only ever renders what it is handed, never
 * decides who is protected.
 */
export function AdminAdminsTable(props: Readonly<AdminAdminsTableProps>): ReactElement {
  return (
    <div className={adminAdminsClasses.tableWrap}>
      <table className={adminAdminsClasses.table}>
        <thead>
          <tr>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminAdminsClasses.th}>
              {props.columnLabels.name}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminAdminsClasses.th}>
              {props.columnLabels.email}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminAdminsClasses.th}>
              {props.columnLabels.role}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminAdminsClasses.th}>
              {props.columnLabels.status}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminAdminsClasses.th}>
              {props.columnLabels.twoFactor}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminAdminsClasses.th}>
              {props.columnLabels.joined}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminAdminsClasses.th}>
              {props.columnLabels.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item) => (
            <tr key={item.id}>
              <td className={adminAdminsClasses.td}>
                <div className={adminAdminsClasses.nameCell}>
                  <span className={adminAdminsClasses.tdName}>{item.name}</span>
                  {item.isSuperAdmin ? <Badge tone="brand">{props.protectedLabel}</Badge> : null}
                  {item.isSelf ? <Badge tone="neutral">{props.selfLabel}</Badge> : null}
                </div>
              </td>
              <td className={adminAdminsClasses.td}>{item.email}</td>
              <td className={adminAdminsClasses.td}>{item.roleLabel}</td>
              <td className={adminAdminsClasses.td}>
                <Badge tone={item.statusBadge.tone}>{item.statusBadge.label}</Badge>
              </td>
              <td className={adminAdminsClasses.td}>{item.twoFactorLabel}</td>
              <td className={adminAdminsClasses.td}>{item.joinedLabel}</td>
              <td className={adminAdminsClasses.td}>
                <div className={adminAdminsClasses.tdActions}>{item.actions}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
