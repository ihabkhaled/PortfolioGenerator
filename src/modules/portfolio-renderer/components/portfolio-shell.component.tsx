import type { ReactElement } from 'react';

import { LANDMARK_IDS } from '@/shared/accessibility/landmark-ids.constants';

import { portfolioShellClasses } from '../constants/template-style.constants';
import type { PortfolioShellProps } from '../types/section-props.types';

/** Header, main landmark and footer for a published portfolio. */
export function PortfolioShell(props: Readonly<PortfolioShellProps>): ReactElement {
  return (
    <div className={portfolioShellClasses.root}>
      {props.banner}
      <header className={portfolioShellClasses.header}>
        <div className={portfolioShellClasses.headerInner}>
          <div className={portfolioShellClasses.brand}>
            <span className={portfolioShellClasses.brandName}>{props.displayName}</span>
            <span className={portfolioShellClasses.brandHeadline}>{props.headline}</span>
          </div>
          <nav aria-label={props.navigationLabel} className={portfolioShellClasses.nav}>
            {props.navigation}
          </nav>
        </div>
      </header>

      <main id={LANDMARK_IDS.mainContent} className={portfolioShellClasses.main}>
        {props.children}
      </main>

      <footer className={portfolioShellClasses.footer}>
        <div className={portfolioShellClasses.footerInner}>
          <p className={portfolioShellClasses.footerNote}>{props.footerNote}</p>
        </div>
      </footer>
    </div>
  );
}
