import type { ReactElement } from 'react';

import { Badge } from '@/packages/ui-primitives';

import { dashboardClasses } from '../constants/dashboard-style.constants';
import type { PortfolioListProps } from '../types/dashboard.types';

export function PortfolioList(props: Readonly<PortfolioListProps>): ReactElement {
  return (
    <ul className={dashboardClasses.list}>
      {props.items.map((item) => (
        <li key={item.id} className={dashboardClasses.item}>
          <div className={dashboardClasses.itemMain}>
            <p className={dashboardClasses.itemName}>{item.title}</p>
            <p className={dashboardClasses.itemMeta}>{item.meta}</p>
          </div>
          <div className={dashboardClasses.itemActions}>
            <Badge tone={item.statusTone}>{item.statusLabel}</Badge>
            {item.actions}
          </div>
        </li>
      ))}
    </ul>
  );
}
