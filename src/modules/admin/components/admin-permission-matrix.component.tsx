import type { ReactElement } from 'react';

import { Badge } from '@/packages/ui-primitives';

import { adminRbacClasses } from '../constants/admin-rbac-style.constants';
import { ADMIN_TABLE_COLUMN_SCOPE } from '../constants/admin-users.constants';
import type { AdminPermissionMatrixProps } from '../types/admin-rbac-view.types';

/**
 * Every `AdminPermission` down one axis, every `AdminRole` across the other —
 * read-only, code-defined policy from `DEFAULT_ROLE_PERMISSIONS`. This never
 * reflects a real admin's saved permissions; the editor below it does.
 */
export function AdminPermissionMatrix(props: Readonly<AdminPermissionMatrixProps>): ReactElement {
  return (
    <div className={adminRbacClasses.matrixWrap}>
      <table className={adminRbacClasses.matrixTable}>
        <thead>
          <tr>
            <th scope={ADMIN_TABLE_COLUMN_SCOPE} className={adminRbacClasses.matrixHeadCell}>
              {props.columnLabels.permission}
            </th>
            {props.columns.map((column) => (
              <th
                key={column.role}
                scope={ADMIN_TABLE_COLUMN_SCOPE}
                className={adminRbacClasses.matrixHeadCell}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.permission}>
              <td className={adminRbacClasses.matrixPermissionCell}>
                <p className={adminRbacClasses.matrixPermissionLabel}>{row.label}</p>
                <p className={adminRbacClasses.matrixPermissionDescription}>{row.description}</p>
              </td>
              {row.grants.map((grant) => (
                <td key={grant.role} className={adminRbacClasses.matrixGrantCell}>
                  <Badge tone={grant.tone}>{grant.label}</Badge>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
