import type { ReactElement } from 'react';

import { principleListClasses } from '../constants/marketing-style.constants';
import type { LandingPrincipleListProps } from '../types/marketing.types';

export function LandingPrincipleList(props: Readonly<LandingPrincipleListProps>): ReactElement {
  return (
    <ul className={principleListClasses.list}>
      {props.principles.map((principle) => (
        <li key={principle.id} className={principleListClasses.item}>
          <h3 className={principleListClasses.title}>{principle.title}</h3>
          <p className={principleListClasses.description}>{principle.description}</p>
        </li>
      ))}
    </ul>
  );
}
