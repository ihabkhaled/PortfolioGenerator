'use client';
// client-boundary-reason: the disclosure has to close itself on route change, which only the browser's current pathname can report.

import { useEffect, useRef, type ReactElement } from 'react';

import { MenuIcon } from '@/packages/icons';
import { usePathname } from '@/packages/navigation/client';

import type { NavDisclosureProps } from '../types/shared-component.types';

import { siteShellClasses } from './site-shell.variants';

/**
 * The header's mobile menu.
 *
 * A native `<details>` carries the open/closed state, not React state — it
 * works before hydration, needs no click-outside handler, and matches the
 * disclosure pattern the FAQ already uses. The one thing native behavior gets
 * wrong for a client-rendered layout: `<details>` is a DOM node the layout
 * keeps across a same-layout navigation, so without this effect a menu link
 * tapped while open would land the reader on the next page with the menu
 * still covering it. Closing on every pathname change is the smallest fix for
 * that one case.
 */
export function NavDisclosure(props: Readonly<NavDisclosureProps>): ReactElement {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const details = detailsRef.current;
    if (details) {
      details.open = false;
    }
  }, [pathname]);

  return (
    <details ref={detailsRef} className={siteShellClasses.mobileMenu}>
      <summary className={siteShellClasses.mobileMenuToggle} aria-label={props.label}>
        <MenuIcon aria-hidden size={20} />
      </summary>
      <div className={siteShellClasses.mobileMenuPanel}>{props.children}</div>
    </details>
  );
}
