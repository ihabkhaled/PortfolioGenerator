import type { ReactElement } from 'react';

import { HomeIcon } from '@/packages/icons';
import { AppLink } from '@/packages/link';
import { LANDMARK_IDS } from '@/shared/accessibility/landmark-ids.constants';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { portfolioShellClasses } from '../constants/template-style.constants';
import type { PortfolioShellProps } from '../types/section-props.types';

/** Header, main landmark and footer for a published portfolio. */
export function PortfolioShell(props: Readonly<PortfolioShellProps>): ReactElement {
  return (
    <div className={portfolioShellClasses.root}>
      {props.banner}
      <header className={portfolioShellClasses.header}>
        <div className={portfolioShellClasses.headerInner}>
          <AppLink
            href={ROUTE_PATHS.home}
            className={portfolioShellClasses.brandLink}
            aria-label={props.homeLabel}
          >
            <HomeIcon aria-hidden size={16} className={portfolioShellClasses.brandHomeIcon} />
            <span className={portfolioShellClasses.platformName}>{props.platformName}</span>
          </AppLink>
          <div className={portfolioShellClasses.identity}>
            <div className={portfolioShellClasses.brand}>
              <span className={portfolioShellClasses.brandName}>{props.displayName}</span>
              {props.headline === null ? null : (
                <span className={portfolioShellClasses.brandHeadline}>{props.headline}</span>
              )}
            </div>
          </div>
          <nav aria-label={props.navigationLabel} className={portfolioShellClasses.nav}>
            {props.navigation}
          </nav>
          <div className={portfolioShellClasses.headerActions}>
            {props.mobileMenu}
            <div className={portfolioShellClasses.desktopActions}>{props.actions}</div>
          </div>
        </div>
      </header>

      {props.isPreview ? (
        <div className={portfolioShellClasses.main}>{props.children}</div>
      ) : (
        <main id={LANDMARK_IDS.mainContent} className={portfolioShellClasses.main}>
          {props.children}
        </main>
      )}

      <footer className={portfolioShellClasses.footer}>
        <div className={portfolioShellClasses.footerInner}>
          <p className={portfolioShellClasses.footerNote}>{props.footerNote}</p>
          <div className={portfolioShellClasses.footerLinks} data-fixed-surface="portfolio-actions">
            {props.footerLinks}
          </div>
        </div>
      </footer>
    </div>
  );
}
