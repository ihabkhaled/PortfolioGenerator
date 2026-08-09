import type { ReactElement } from 'react';

import { AppLink } from '@/packages/link';

import { directoryClasses } from '../constants/marketing-style.constants';
import type { LandingDirectoryProps } from '../types/marketing.types';

export function LandingDirectory(props: Readonly<LandingDirectoryProps>): ReactElement {
  return (
    <ul className={directoryClasses.grid}>
      {props.items.map((item) => (
        <li key={item.id} className={directoryClasses.item}>
          <h3 className={directoryClasses.title}>{item.title}</h3>
          <p className={directoryClasses.description}>{item.description}</p>
          <AppLink href={item.href} className={directoryClasses.link}>
            {props.linkLabel}
          </AppLink>
        </li>
      ))}
    </ul>
  );
}
