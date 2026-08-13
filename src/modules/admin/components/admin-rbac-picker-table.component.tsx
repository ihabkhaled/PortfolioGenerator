import type { ReactElement } from 'react';

import { AppLink, toAppRoute } from '@/packages/link';
import { Badge } from '@/packages/ui-primitives';

import { adminRbacClasses } from '../constants/admin-rbac-style.constants';
import { ADMIN_TABLE_COLUMN_SCOPE } from '../constants/admin-users.constants';
import type { AdminRbacPickerTableProps } from '../types/admin-rbac-view.types';

/**
 * The searchable, paginated admin roster an RBAC editor target is chosen
 * from. Purely presentational — every label and href arrives pre-computed;
 * the row currently open in the editor shows a badge in place of a
 * redundant "edit this admin you are already editing" link.
 */
export function AdminRbacPickerTable(props: Readonly<AdminRbacPickerTableProps>): ReactElement {
  return (
    <div className={adminRbacClasses.pickerWrap}>
      <table className={adminRbacClasses.pickerTable}>
        <thead>
          <tr>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminRbacClasses.pickerHeadCell}>
              {props.columnLabels.name}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminRbacClasses.pickerHeadCell}>
              {props.columnLabels.email}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminRbacClasses.pickerHeadCell}>
              {props.columnLabels.role}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminRbacClasses.pickerHeadCell}>
              {props.columnLabels.permissions}
            </th>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminRbacClasses.pickerHeadCell}>
              {props.columnLabels.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item) => (
            <tr key={item.id}>
              <td className={adminRbacClasses.pickerCell}>{item.name}</td>
              <td className={adminRbacClasses.pickerCell}>{item.email}</td>
              <td className={adminRbacClasses.pickerCell}>{item.roleLabel}</td>
              <td className={adminRbacClasses.pickerCell}>{item.permissionCountLabel}</td>
              <td className={adminRbacClasses.pickerCell}>
                {item.isSelected ? (
                  <Badge tone="neutral">{item.selectedLabel}</Badge>
                ) : (
                  <AppLink
                    href={toAppRoute(item.editHref)}
                    className={adminRbacClasses.pickerEditLink}
                  >
                    {item.editLabel}
                  </AppLink>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
