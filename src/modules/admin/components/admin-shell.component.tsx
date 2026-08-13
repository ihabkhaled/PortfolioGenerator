import type { ReactElement } from 'react';

import { AppLink, toAppRoute } from '@/packages/link';
import { cn } from '@/packages/ui-primitives';

import { adminShellClasses } from '../constants/admin-shell-style.constants';
import type { AdminShellProps } from '../types/admin-shell-view.types';

/**
 * The `/managawy` chrome: a top bar spanning every page, the nav rail below
 * it, and the content frame.
 *
 * Purely presentational: nav items, labels, the current-route decision and
 * the whole top bar arrive as props from the layout, which is the only place
 * in this tree that knows the route table and the request.
 */
export function AdminShell(props: Readonly<AdminShellProps>): ReactElement {
  return (
    <div className={adminShellClasses.root}>
      {props.topBar}
      <div className={adminShellClasses.body}>
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
                aria-current={item.isCurrent ? 'page' : undefined}
                className={cn(
                  adminShellClasses.navLink,
                  item.isCurrent ? adminShellClasses.navLinkCurrent : undefined,
                )}
              >
                {item.label}
              </AppLink>
            ),
          )}
        </nav>
        <main className={adminShellClasses.main}>{props.children}</main>
      </div>
    </div>
  );
}
