'use client';
// client-boundary-reason: whether the mobile menu is open is interaction
// state a server component cannot hold.

import { useState, type ReactElement } from 'react';

import { CloseIcon, MenuIcon } from '@/packages/icons';
import { AppLink, toAppRoute } from '@/packages/link';
import { cn } from '@/packages/ui-primitives';
import { VisuallyHidden } from '@/shared/components/primitives/visually-hidden.component';

import { portfolioShellClasses } from '../constants/template-style.constants';
import { resolveNavIcon } from '../helpers/nav-icon.helper';
import type { PortfolioNavMenuProps } from '../types/portfolio-nav-menu.types';

/**
 * The `lg:hidden` counterpart to the header's horizontal nav bar
 * (`portfolioShellClasses.nav`, `lg:flex` and up): below that breakpoint a
 * scrolling row of six-plus words has no discoverability, so this collapses
 * the same items behind a toggle instead.
 *
 * One instance owns both the toggle button and the panel it opens — they
 * share the same `open` state — even though the panel is visually anchored to
 * the header itself (`portfolioShellClasses.mobileNav` is `absolute` against
 * `header`'s `sticky` positioning), not to wherever this component happens to
 * sit inside `headerActions`.
 */
export function PortfolioNavMenuContainer(props: Readonly<PortfolioNavMenuProps>): ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={portfolioShellClasses.navToggle}
        aria-expanded={open}
        aria-controls="portfolio-mobile-nav"
        onClick={() => {
          setOpen((current) => !current);
        }}
      >
        {open ? <CloseIcon aria-hidden size={20} /> : <MenuIcon aria-hidden size={20} />}
        <VisuallyHidden>{props.toggleLabel}</VisuallyHidden>
      </button>

      {open ? (
        <nav
          id="portfolio-mobile-nav"
          aria-label={props.navigationLabel}
          className={portfolioShellClasses.mobileNav}
        >
          {props.items.map((item) => (
            <AppLink
              key={item.pageId}
              href={toAppRoute(item.href)}
              aria-current={item.isCurrent ? 'page' : undefined}
              className={cn(
                portfolioShellClasses.mobileNavLink,
                item.isCurrent ? portfolioShellClasses.mobileNavLinkCurrent : undefined,
              )}
              onClick={() => {
                setOpen(false);
              }}
            >
              {resolveNavIcon(item)}
              {item.label}
            </AppLink>
          ))}
          <div className={portfolioShellClasses.mobileNavActions}>{props.actions}</div>
        </nav>
      ) : null}
    </>
  );
}
