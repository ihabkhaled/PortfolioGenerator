import type { ReactElement } from 'react';

import { AppLink, toAppRoute } from '@/packages/link';

import { adminAuditLogClasses } from '../constants/admin-audit-log-style.constants';
import { ADMIN_AUDIT_LOG_TABLE_HEAD_SCOPE } from '../constants/admin-audit-log.constants';
import type { AdminAuditLogTableProps } from '../types/admin-audit-log-view.types';

/**
 * Every recorded admin action, reverse-chronological: strictly read-only —
 * no row carries an action of any kind, mirroring the append-only guarantee
 * the underlying `AdminAuditEvent` table itself makes.
 *
 * Metadata renders as a `key: value` list rather than the stored JSON blob,
 * so a support investigation reads the payload at a glance instead of
 * parsing it.
 */
export function AdminAuditLogTable(props: Readonly<AdminAuditLogTableProps>): ReactElement {
  return (
    <div className={adminAuditLogClasses.tableWrapper}>
      <table className={adminAuditLogClasses.table}>
        <thead>
          <tr>
            <th scope={ADMIN_AUDIT_LOG_TABLE_HEAD_SCOPE} className={adminAuditLogClasses.headCell}>
              {props.columnLabels.when}
            </th>
            <th scope={ADMIN_AUDIT_LOG_TABLE_HEAD_SCOPE} className={adminAuditLogClasses.headCell}>
              {props.columnLabels.admin}
            </th>
            <th scope={ADMIN_AUDIT_LOG_TABLE_HEAD_SCOPE} className={adminAuditLogClasses.headCell}>
              {props.columnLabels.action}
            </th>
            <th scope={ADMIN_AUDIT_LOG_TABLE_HEAD_SCOPE} className={adminAuditLogClasses.headCell}>
              {props.columnLabels.targetType}
            </th>
            <th scope={ADMIN_AUDIT_LOG_TABLE_HEAD_SCOPE} className={adminAuditLogClasses.headCell}>
              {props.columnLabels.targetId}
            </th>
            <th scope={ADMIN_AUDIT_LOG_TABLE_HEAD_SCOPE} className={adminAuditLogClasses.headCell}>
              {props.columnLabels.metadata}
            </th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.id} className={adminAuditLogClasses.row}>
              <td className={adminAuditLogClasses.cell}>
                <time dateTime={row.whenIso} className={adminAuditLogClasses.whenText}>
                  {row.whenLabel}
                </time>
              </td>
              <td className={adminAuditLogClasses.cell}>
                <span className={adminAuditLogClasses.adminText}>{row.adminLabel}</span>
              </td>
              <td className={adminAuditLogClasses.cell}>
                <span className={adminAuditLogClasses.actionText}>{row.actionLabel}</span>
                <span className={adminAuditLogClasses.actionCode}>{row.actionCode}</span>
              </td>
              <td className={adminAuditLogClasses.cell}>
                <span className={adminAuditLogClasses.targetTypeText}>{row.targetTypeLabel}</span>
              </td>
              <td className={adminAuditLogClasses.cell}>
                {row.targetHref === null ? (
                  <span className={adminAuditLogClasses.targetIdText}>{row.targetId}</span>
                ) : (
                  <AppLink
                    href={toAppRoute(row.targetHref)}
                    className={adminAuditLogClasses.targetIdLink}
                  >
                    {row.targetId}
                  </AppLink>
                )}
              </td>
              <td className={adminAuditLogClasses.cell}>
                {row.metadataEntries.length === 0 ? (
                  <span className={adminAuditLogClasses.metadataEmpty}>
                    {props.metadataEmptyLabel}
                  </span>
                ) : (
                  <dl className={adminAuditLogClasses.metadataList}>
                    {row.metadataEntries.map((entry) => (
                      <div key={entry.key} className={adminAuditLogClasses.metadataRow}>
                        <dt className={adminAuditLogClasses.metadataKey}>{entry.key}:</dt>
                        <dd className={adminAuditLogClasses.metadataValue}>{entry.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
