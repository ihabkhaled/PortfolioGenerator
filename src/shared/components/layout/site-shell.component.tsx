import type { ReactElement } from 'react';

import { LANDMARK_IDS } from '@/shared/accessibility/landmark-ids.constants';
import { LOCALIZATION_CONTROLS_TARGET_ID } from '@/shared/constants/localization-target.constants';

import type { SiteShellProps } from '../types/shared-component.types';

import { NavDisclosure } from './nav-disclosure.container';
import { siteShellClasses } from './site-shell.variants';

/**
 * Header, main landmark and footer for every platform (non-portfolio) page.
 *
 * The home link and brand mark are rendered twice — once in the header, once
 * in the footer's brand row — because both are the same stateless anchors to
 * `/`, and a footer that repeats them is a visitor's fastest way back to the
 * start after scrolling past everything else on the page.
 *
 * `navigation` and `actions` are likewise rendered twice: once inline for
 * `sm:` and up, once inside the mobile `NavDisclosure` panel. Only one copy
 * is ever in the accessibility tree at a given viewport, because the hidden
 * one is `display:none` — Tailwind's `hidden`/`sm:hidden` pair, not a visual
 * trick — so this is not a duplicate landmark a screen reader would announce
 * twice.
 */
export function SiteShell(props: Readonly<SiteShellProps>): ReactElement {
  return (
    <>
      <header className={siteShellClasses.header}>
        <div className={siteShellClasses.headerInner}>
          <div className={siteShellClasses.brandGroup}>
            {props.homeLink}
            {props.brand}
          </div>

          <div className={siteShellClasses.headerActions}>
            <nav
              id={LANDMARK_IDS.primaryNavigation}
              aria-label={props.navigationLabel}
              className={siteShellClasses.nav}
            >
              {props.navigation}
            </nav>
            {props.actions}
            <div id={LOCALIZATION_CONTROLS_TARGET_ID} />
          </div>

          {props.account === undefined ? null : (
            <div className={siteShellClasses.headerAccount}>{props.account}</div>
          )}

          <NavDisclosure label={props.menuLabel}>
            <nav aria-label={props.navigationLabel} className={siteShellClasses.mobileNav}>
              {props.navigation}
            </nav>
            <div className={siteShellClasses.mobileActions}>{props.actions}</div>
          </NavDisclosure>
        </div>
      </header>

      <main id={LANDMARK_IDS.mainContent} className={siteShellClasses.main}>
        {props.children}
      </main>

      <footer className={siteShellClasses.footer}>
        <div className={siteShellClasses.footerInner}>
          <div className={siteShellClasses.footerBrand}>
            <div className={siteShellClasses.footerBrandRow}>
              {props.homeLink}
              <span className={siteShellClasses.footerBrandName}>{props.brandName}</span>
            </div>
            <p className={siteShellClasses.footerNote}>{props.footerNote}</p>
          </div>
          <div className={siteShellClasses.footerColumns}>{props.footerLinks}</div>
        </div>
      </footer>
    </>
  );
}
