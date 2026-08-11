import type { ReactElement } from 'react';

import { AppLink, toAppRoute } from '@/packages/link';
import { cn } from '@/packages/ui-primitives';

import { portfolioShellClasses } from '../constants/template-style.constants';
import { resolveNavIcon } from '../helpers/nav-icon.helper';
import type { PortfolioNavProps } from '../types/section-props.types';

/**
 * The links inside the portfolio's navigation landmark.
 *
 * A fragment rather than its own `<nav>`: the shell already owns the landmark,
 * and a second one nested inside it would announce the same region twice.
 *
 * The home entry carries an icon as well as its label — it is the one link a
 * reader reaches for without reading — and the small set of other standard
 * imported pages get one too (`resolveNavIcon`), so the bar reads at a glance
 * rather than as six words in a row. The label always stays: an icon alone is
 * a guess, and it is the label a screen reader announces.
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
          {resolveNavIcon(item)}
          {item.label}
        </AppLink>
      ))}
    </>
  );
}
