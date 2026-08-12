import type { ReactElement } from 'react';

import { DocumentIcon } from '@/packages/icons';
import { AppLink, toAppRoute } from '@/packages/link';

import { portfolioPdfDownloadLinkClasses } from '../constants/portfolio-pdf-style.constants';
import type { PortfolioPdfDownloadLinkProps } from '../types/portfolio-pdf.types';

/** Props in, TSX out — the footer decides whether to render this at all. */
export function PortfolioPdfDownloadLink(
  props: Readonly<PortfolioPdfDownloadLinkProps>,
): ReactElement {
  return (
    <AppLink
      href={toAppRoute(props.href)}
      download={props.downloadFilename}
      prefetch={false}
      className={portfolioPdfDownloadLinkClasses.link}
    >
      <DocumentIcon aria-hidden size={16} />
      {props.label}
    </AppLink>
  );
}
