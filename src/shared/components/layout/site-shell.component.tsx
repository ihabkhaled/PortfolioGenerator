import type { ReactElement } from 'react';

import { LANDMARK_IDS } from '@/shared/accessibility/landmark-ids.constants';

import type { SiteShellProps } from '../types/shared-component.types';

import { siteShellClasses } from './site-shell.variants';

/** Header, main landmark and footer for every platform (non-portfolio) page. */
export function SiteShell(props: Readonly<SiteShellProps>): ReactElement {
  return (
    <>
      <header className={siteShellClasses.header}>
        <div className={siteShellClasses.headerInner}>
          {props.brand}
          <div className={siteShellClasses.headerActions}>
            <nav
              id={LANDMARK_IDS.primaryNavigation}
              aria-label={props.navigationLabel}
              className={siteShellClasses.nav}
            >
              {props.navigation}
            </nav>
            {props.actions}
          </div>
        </div>
      </header>

      <main id={LANDMARK_IDS.mainContent} className={siteShellClasses.main}>
        {props.children}
      </main>

      <footer className={siteShellClasses.footer}>
        <div className={siteShellClasses.footerInner}>
          <p className={siteShellClasses.footerNote}>{props.footerNote}</p>
          <div className={siteShellClasses.footerLinks}>{props.footerLinks}</div>
        </div>
      </footer>
    </>
  );
}
