import type { ReactElement } from 'react';

import type { PortfolioNavigationItem } from '@/modules/portfolio-document';
import { OverviewIcon } from '@/packages/icons';

import { NAV_ICON_BY_SLUG } from '../constants/nav-icon.constants';

/**
 * The home entry always gets its own icon; other pages depend on their slug
 * (`NAV_ICON_BY_SLUG`). Renders the element directly rather than returning the
 * icon component reference, so the caller — a `.component.tsx` file — never
 * needs a local variable to hold an intermediate value.
 */
export function resolveNavIcon(item: PortfolioNavigationItem): ReactElement | null {
  const Icon = item.isHome ? OverviewIcon : NAV_ICON_BY_SLUG[item.slug];

  return Icon === undefined ? null : <Icon aria-hidden size={15} />;
}
