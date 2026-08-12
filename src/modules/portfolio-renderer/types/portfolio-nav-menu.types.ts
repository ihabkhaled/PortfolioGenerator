import type { ReactNode } from 'react';

import type { PortfolioNavigationItem } from '@/modules/portfolio-document';

export interface PortfolioNavMenuProps {
  readonly items: readonly PortfolioNavigationItem[];
  readonly navigationLabel: string;
  readonly toggleLabel: string;
  readonly actions: ReactNode;
}
