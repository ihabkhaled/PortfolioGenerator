import type { ReactElement } from 'react';

import { ChevronDownIcon } from '@/packages/icons';
import { AppLink, toAppRoute } from '@/packages/link';
import { accountInitial } from '@/shared/utils/account-initial.util';

import { adminShellClasses } from '../constants/admin-shell-style.constants';
import type { AdminAccountMenuProps } from '../types/admin-shell-view.types';

/**
 * The signed-in admin's own menu, mirroring the platform's `AccountMenu`: a
 * native `<details>` disclosure needs no client JavaScript to open or close.
 * Unlike the platform version it also names the admin's role, since a
 * `MODERATOR` and a `SUPER_ADMIN` see materially different nav rails and that
 * distinction should be visible, not just enforced.
 */
export function AdminAccountMenu(props: Readonly<AdminAccountMenuProps>): ReactElement {
  return (
    <details className={adminShellClasses.accountMenu}>
      <summary
        className={adminShellClasses.accountMenuToggle}
        aria-label={props.menuLabel}
        role="button"
      >
        <span aria-hidden className={adminShellClasses.accountAvatar}>
          {accountInitial(props.name, props.email)}
        </span>
        <span className={adminShellClasses.accountMenuName}>{props.name}</span>
        <ChevronDownIcon aria-hidden className={adminShellClasses.accountMenuIndicator} size={14} />
      </summary>
      <div className={adminShellClasses.accountMenuPanel}>
        <div className={adminShellClasses.accountMenuIdentity}>
          <span className={adminShellClasses.accountMenuName}>{props.name}</span>
          <span className={adminShellClasses.accountMenuEmail}>{props.email}</span>
          <span className={adminShellClasses.accountMenuRole}>{props.roleName}</span>
        </div>
        <AppLink
          href={toAppRoute(props.preferencesHref)}
          className={adminShellClasses.accountMenuLink}
        >
          {props.preferencesLabel}
        </AppLink>
        <AppLink
          href={toAppRoute(props.changePasswordHref)}
          className={adminShellClasses.accountMenuLink}
        >
          {props.changePasswordLabel}
        </AppLink>
        <div className={adminShellClasses.accountMenuLogout}>{props.logout}</div>
      </div>
    </details>
  );
}
