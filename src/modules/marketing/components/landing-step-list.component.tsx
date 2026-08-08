import type { ReactElement } from 'react';

import { stepListClasses } from '../constants/marketing-style.constants';
import type { LandingStepListProps } from '../types/marketing.types';

/**
 * The delivery sequence reads as a vertical list: order is the point, and a
 * grid would leave an orphan cell.
 */
export function LandingStepList(props: Readonly<LandingStepListProps>): ReactElement {
  return (
    <ol className={stepListClasses.list}>
      {props.steps.map((step) => (
        <li key={step.id} className={stepListClasses.item}>
          <span className={stepListClasses.step}>{step.index}</span>
          <h3 className={stepListClasses.title}>{step.title}</h3>
          <p className={stepListClasses.description}>{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
