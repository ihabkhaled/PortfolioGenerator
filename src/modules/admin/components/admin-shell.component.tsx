import type { ReactElement } from 'react';

import { AppLink, toAppRoute } from '@/packages/link';

import { adminShellClasses } from '../constants/admin-shell-style.constants';
import type { AdminShellProps } from '../types/admin-shell-view.types';

/**
 * The `/managawy` nav rail and content frame.
 *
 * Purely presentational: nav items, labels and the current-route decision all
 * arrive as props from the layout, which is the only place in this tree that
 * knows the route table and the request.
 */
export function AdminShell(props: Readonly<AdminShellProps>): ReactElement {
  return (
    <div className={adminShellClasses.root}>
      <nav className={adminShellClasses.nav} aria-label={props.navAriaLabel}>
        <span className={adminShellClasses.navBrand}>{props.brandLabel}</span>
        {props.navItems.map((item) =>
          item.href === null ? (
            <span key={item.id} className={adminShellClasses.navLinkDisabled} aria-disabled>
              {item.label}
            </span>
          ) : (
            <AppLink
              key={item.id}
              href={toAppRoute(item.href)}
              className={adminShellClasses.navLink}
            >
              {item.label}
            </AppLink>
          ),
        )}
      </nav>
      <main className={adminShellClasses.main}>{props.children}</main>
    </div>
  );
}
