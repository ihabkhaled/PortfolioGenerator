import type { ReactElement } from 'react';

import { adminAccountClasses } from '../constants/admin-account-style.constants';
import type { AdminAccountSummaryProps } from '../types/admin-account-view.types';

/** What the platform holds about the signed-in admin: name, email, role, grants. */
export function AdminAccountSummary(props: Readonly<AdminAccountSummaryProps>): ReactElement {
  return (
    <section className={adminAccountClasses.section}>
      <h2 className={adminAccountClasses.sectionTitle}>{props.title}</h2>
      <dl className={adminAccountClasses.definitionList}>
        <div className={adminAccountClasses.definitionRow}>
          <dt className={adminAccountClasses.definitionTerm}>{props.nameLabel}</dt>
          <dd className={adminAccountClasses.definitionValue}>{props.name}</dd>
        </div>
        <div className={adminAccountClasses.definitionRow}>
          <dt className={adminAccountClasses.definitionTerm}>{props.emailLabel}</dt>
          <dd className={adminAccountClasses.definitionValue}>{props.email}</dd>
        </div>
        <div className={adminAccountClasses.definitionRow}>
          <dt className={adminAccountClasses.definitionTerm}>{props.roleLabel}</dt>
          <dd className={adminAccountClasses.definitionValue}>{props.roleName}</dd>
        </div>
      </dl>
      <h3 className={adminAccountClasses.subsectionTitle}>{props.permissionsLabel}</h3>
      <ul className={adminAccountClasses.permissionList}>
        {props.permissions.map((permission) => (
          <li key={permission} className={adminAccountClasses.permissionItem}>
            {permission}
          </li>
        ))}
      </ul>
    </section>
  );
}
