import type { ReactElement } from 'react';

import { HomeIcon } from '@/packages/icons';
import { AppLink, toAppRoute } from '@/packages/link';

import { adminShellClasses } from '../constants/admin-shell-style.constants';
import type { AdminTopBarProps } from '../types/admin-shell-view.types';

/**
 * The bar above the nav rail on every `/managawy` page: a way back to the
 * platform's own home on the left, reader-owned controls and the signed-in
 * admin's own menu on the right.
 */
export function AdminTopBar(props: Readonly<AdminTopBarProps>): ReactElement {
  return (
    <header className={adminShellClasses.topBar}>
      <div className={adminShellClasses.topBarBrandGroup}>
        <AppLink
          href={toAppRoute(props.homeHref)}
          aria-label={props.homeLabel}
          className={adminShellClasses.topBarHomeLink}
        >
          <HomeIcon aria-hidden size={18} />
        </AppLink>
        <span className={adminShellClasses.topBarBrand}>{props.brandLabel}</span>
      </div>
      <div className={adminShellClasses.topBarActions}>
        {props.actions}
        {props.accountMenu}
      </div>
    </header>
  );
}
