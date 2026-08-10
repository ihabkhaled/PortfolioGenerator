import type { ReactElement } from 'react';

import { AppLink } from '@/packages/link';

import type { SiteFooterNavProps } from '../types/shared-component.types';

import { siteShellClasses } from './site-shell.variants';

/** The footer's grouped link columns — product, company, legal, resources. */
export function SiteFooterNav(props: Readonly<SiteFooterNavProps>): ReactElement {
  return (
    <>
      {props.columns.map((column) => (
        <div key={column.id} className={siteShellClasses.footerColumn}>
          <p className={siteShellClasses.footerColumnHeading}>{column.heading}</p>
          <ul className={siteShellClasses.footerColumnList}>
            {column.links.map((link) => (
              <li key={link.id}>
                <AppLink href={link.href} className={siteShellClasses.footerLink}>
                  {link.label}
                </AppLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
