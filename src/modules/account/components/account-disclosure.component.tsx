import type { ReactElement } from 'react';

import { ChevronDownIcon } from '@/packages/icons';

import { accountClasses } from '../constants/account-style.constants';
import type { AccountDisclosureProps } from '../types/account-view.types';

export function AccountDisclosure(props: Readonly<AccountDisclosureProps>): ReactElement {
  return (
    <details
      className={props.danger ? accountClasses.dangerDisclosure : accountClasses.disclosure}
      open={props.defaultOpen}
    >
      <summary className={accountClasses.disclosureSummary}>
        <span className={accountClasses.disclosureCopy}>
          <span role="heading" aria-level={2} className={accountClasses.disclosureTitle}>
            {props.title}
          </span>
          {props.hint === undefined ? null : (
            <span className={accountClasses.disclosureHint}>{props.hint}</span>
          )}
        </span>
        <ChevronDownIcon aria-hidden size={18} className={accountClasses.disclosureIcon} />
      </summary>
      <div className={accountClasses.disclosureBody}>{props.children}</div>
    </details>
  );
}
