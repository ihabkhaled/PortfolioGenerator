import type { ReactElement } from 'react';

import { accountClasses } from '../constants/account-style.constants';
import type { AccountSummaryProps } from '../types/account-view.types';

/**
 * What the platform holds about the person reading the page.
 *
 * Short by design. If this list ever needs a scrollbar, the product has started
 * collecting things it was not asked to.
 */
export function AccountSummary(props: Readonly<AccountSummaryProps>): ReactElement {
  return (
    <section className={accountClasses.section}>
      <h2 className={accountClasses.sectionTitle}>{props.title}</h2>
      <dl className={accountClasses.definitionList}>
        <div className={accountClasses.definitionRow}>
          <dt className={accountClasses.definitionTerm}>{props.nameLabel}</dt>
          <dd className={accountClasses.definitionValue}>{props.name}</dd>
        </div>
        <div className={accountClasses.definitionRow}>
          <dt className={accountClasses.definitionTerm}>{props.emailLabel}</dt>
          <dd className={accountClasses.definitionValue}>{props.email}</dd>
        </div>
        <div className={accountClasses.definitionRow}>
          <dt className={accountClasses.definitionTerm}>{props.portfolioCountLabel}</dt>
          <dd className={accountClasses.definitionValue}>{props.portfolioCount}</dd>
        </div>
      </dl>
    </section>
  );
}
