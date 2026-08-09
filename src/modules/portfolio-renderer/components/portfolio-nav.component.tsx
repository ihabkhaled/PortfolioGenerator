import type { ReactElement } from 'react';

import { HomeIcon } from '@/packages/icons';
import { AppLink, toAppRoute } from '@/packages/link';
import { cn } from '@/packages/ui-primitives';

import { portfolioShellClasses } from '../constants/template-style.constants';
import type { PortfolioNavProps } from '../types/section-props.types';

/**
 * The links inside the portfolio's navigation landmark.
 *
 * A fragment rather than its own `<nav>`: the shell already owns the landmark,
 * and a second one nested inside it would announce the same region twice.
 *
 * The home entry carries an icon as well as its label. It is the one link a
 * reader reaches for without reading, and an icon makes it findable at a glance
 * on a bar that may hold six other words. The label stays — an icon alone is a
 * guess, and it is the label a screen reader announces.
 */
export function PortfolioNav(props: Readonly<PortfolioNavProps>): ReactElement {
  return (
    <>
      {props.items.map((item) => (
        <AppLink
          key={item.pageId}
          href={toAppRoute(item.href)}
          aria-current={item.isCurrent ? 'page' : undefined}
          className={cn(
            portfolioShellClasses.navLink,
            item.isCurrent ? portfolioShellClasses.navLinkCurrent : undefined,
          )}
        >
          {item.isHome ? <HomeIcon aria-hidden size={15} /> : null}
          {item.label}
        </AppLink>
      ))}
    </>
  );
}
