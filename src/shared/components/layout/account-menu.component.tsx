import type { ReactElement } from 'react';

import { ChevronDownIcon } from '@/packages/icons';
import { AppLink } from '@/packages/link';
import { accountInitial } from '@/shared/utils/account-initial.util';

import type { AccountMenuProps } from '../types/shared-component.types';

import { siteShellClasses } from './site-shell.variants';

/** Compact authenticated navigation shared by every platform shell. */
export function AccountMenu(props: Readonly<AccountMenuProps>): ReactElement {
  return (
    <details className={siteShellClasses.accountMenu}>
      <summary
        className={siteShellClasses.accountMenuToggle}
        aria-label={props.menuLabel}
        role="button"
      >
        <span aria-hidden className={siteShellClasses.accountAvatar}>
          {accountInitial(props.name, props.email)}
        </span>
        <ChevronDownIcon
          aria-hidden
          data-testid="account-menu-chevron"
          className={siteShellClasses.accountMenuIndicator}
          size={14}
        />
      </summary>
      <div className={siteShellClasses.accountMenuPanel}>
        <AppLink href={props.dashboardHref} className={siteShellClasses.accountMenuLink}>
          {props.dashboardLabel}
        </AppLink>
        <AppLink href={props.preferencesHref} className={siteShellClasses.accountMenuLink}>
          {props.preferencesLabel}
        </AppLink>
        <div className={siteShellClasses.accountMenuLogout}>{props.logout}</div>
      </div>
    </details>
  );
}
