import type { ReactElement } from 'react';

import type { EmptyStateProps } from '../types/shared-component.types';

import { feedbackClasses } from './feedback.variants';

export function EmptyState(props: Readonly<EmptyStateProps>): ReactElement {
  return (
    <div className={feedbackClasses.panel}>
      <p className={feedbackClasses.title}>{props.title}</p>
      <p className={feedbackClasses.description}>{props.description}</p>
      {props.action ? <div className={feedbackClasses.actions}>{props.action}</div> : null}
    </div>
  );
}
