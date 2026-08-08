import type { ReactElement } from 'react';

import type { ErrorStateProps } from '../types/shared-component.types';

import { feedbackClasses } from './feedback.variants';

export function ErrorState(props: Readonly<ErrorStateProps>): ReactElement {
  return (
    <div className={feedbackClasses.errorPanel} role="alert">
      <p className={feedbackClasses.title}>{props.title}</p>
      <p className={feedbackClasses.description}>{props.description}</p>
      {props.action ? <div className={feedbackClasses.actions}>{props.action}</div> : null}
    </div>
  );
}
