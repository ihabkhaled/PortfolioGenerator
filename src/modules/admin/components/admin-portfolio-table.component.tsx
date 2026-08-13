import type { ReactElement } from 'react';

import { AppLink, toAppRoute } from '@/packages/link';
import { Badge } from '@/packages/ui-primitives';

import { adminPortfolioClasses } from '../constants/admin-portfolio-style.constants';
import { ADMIN_PORTFOLIO_TABLE_HEAD_SCOPE } from '../constants/admin-portfolio.constants';
import type { AdminPortfolioTableProps } from '../types/admin-portfolio-view.types';

/**
 * Every portfolio, across every owner: the moderation table.
 *
 * Purely presentational — every href, label and tone arrives pre-computed on
 * each row, and the per-row `actions` node (suspend/activate, delete) is
 * composed by the page from client containers, exactly like the owner-facing
 * `PortfolioList` composes its actions.
 */
export function AdminPortfolioTable(props: Readonly<AdminPortfolioTableProps>): ReactElement {
  return (
    <div className={adminPortfolioClasses.tableWrapper}>
      <table className={adminPortfolioClasses.table}>
        <thead>
          <tr>
            <th scope={ADMIN_PORTFOLIO_TABLE_HEAD_SCOPE} className={adminPortfolioClasses.headCell}>
              {props.columnLabels.slug}
            </th>
            <th scope={ADMIN_PORTFOLIO_TABLE_HEAD_SCOPE} className={adminPortfolioClasses.headCell}>
              {props.columnLabels.owner}
            </th>
            <th scope={ADMIN_PORTFOLIO_TABLE_HEAD_SCOPE} className={adminPortfolioClasses.headCell}>
              {props.columnLabels.status}
            </th>
            <th scope={ADMIN_PORTFOLIO_TABLE_HEAD_SCOPE} className={adminPortfolioClasses.headCell}>
              {props.columnLabels.suspended}
            </th>
            <th scope={ADMIN_PORTFOLIO_TABLE_HEAD_SCOPE} className={adminPortfolioClasses.headCell}>
              {props.columnLabels.updated}
            </th>
            <th scope={ADMIN_PORTFOLIO_TABLE_HEAD_SCOPE} className={adminPortfolioClasses.headCell}>
              {props.columnLabels.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.id} className={adminPortfolioClasses.row}>
              <td className={adminPortfolioClasses.cell}>
                <AppLink
                  href={toAppRoute(row.portfolioHref)}
                  className={adminPortfolioClasses.slugLink}
                >
                  {row.slug}
                </AppLink>
              </td>
              <td className={adminPortfolioClasses.cell}>
                <AppLink
                  href={toAppRoute(row.ownerHref)}
                  className={adminPortfolioClasses.ownerLink}
                >
                  {row.ownerEmail}
                </AppLink>
              </td>
              <td className={adminPortfolioClasses.cell}>
                <Badge tone={row.statusTone}>{row.statusLabel}</Badge>
              </td>
              <td className={adminPortfolioClasses.cell}>
                <Badge tone={row.suspendedTone}>{row.suspendedLabel}</Badge>
              </td>
              <td className={adminPortfolioClasses.cell}>
                <span className={adminPortfolioClasses.updatedText}>{row.updatedAtLabel}</span>
              </td>
              <td className={adminPortfolioClasses.actionsCell}>{row.actions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
