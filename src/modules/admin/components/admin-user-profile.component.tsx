import type { ReactElement } from 'react';

import { Badge } from '@/packages/ui-primitives';

import { adminUsersClasses } from '../constants/admin-users-style.constants';
import type { AdminUserDetailProfileProps } from '../types/admin-users-view.types';

/** What the platform holds about one user, plus the two controls an admin acts through. */
export function AdminUserProfile(props: Readonly<AdminUserDetailProfileProps>): ReactElement {
  return (
    <section className={adminUsersClasses.profileCard}>
      <div className={adminUsersClasses.profileHeader}>
        <dl className={adminUsersClasses.definitionList}>
          <div className={adminUsersClasses.definitionRow}>
            <dt className={adminUsersClasses.definitionTerm}>{props.nameLabel}</dt>
            <dd className={adminUsersClasses.definitionValue}>{props.name}</dd>
          </div>
          <div className={adminUsersClasses.definitionRow}>
            <dt className={adminUsersClasses.definitionTerm}>{props.emailLabel}</dt>
            <dd className={adminUsersClasses.definitionValue}>{props.email}</dd>
          </div>
          <div className={adminUsersClasses.definitionRow}>
            <dt className={adminUsersClasses.definitionTerm}>{props.verifiedLabel}</dt>
            <dd className={adminUsersClasses.definitionValue}>{props.verifiedValue}</dd>
          </div>
          <div className={adminUsersClasses.definitionRow}>
            <dt className={adminUsersClasses.definitionTerm}>{props.statusLabel}</dt>
            <dd className={adminUsersClasses.definitionValue}>
              <Badge tone={props.statusBadge.tone}>{props.statusBadge.label}</Badge>
            </dd>
          </div>
          <div className={adminUsersClasses.definitionRow}>
            <dt className={adminUsersClasses.definitionTerm}>{props.joinedLabel}</dt>
            <dd className={adminUsersClasses.definitionValue}>{props.joinedValue}</dd>
          </div>
        </dl>
        <div className={adminUsersClasses.profileActions}>
          {props.statusAction}
          {props.resetPasswordAction}
        </div>
      </div>
    </section>
  );
}
