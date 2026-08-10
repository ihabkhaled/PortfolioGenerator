import type { ReactElement } from 'react';

import { CloseIcon } from '@/packages/icons';

import type { ErrorStateProps } from '../types/shared-component.types';

import { feedbackClasses } from './feedback.variants';

export function ErrorState(props: Readonly<ErrorStateProps>): ReactElement {
  return (
    <div className={feedbackClasses.errorPanel} role="alert">
      {props.onDismiss ? (
        <button
          type="button"
          onClick={props.onDismiss}
          aria-label={props.dismissLabel}
          className={feedbackClasses.dismiss}
        >
          <CloseIcon aria-hidden size={16} />
        </button>
      ) : null}
      <p className={feedbackClasses.title}>{props.title}</p>
      <p className={feedbackClasses.description}>{props.description}</p>
      {props.action ? <div className={feedbackClasses.actions}>{props.action}</div> : null}
    </div>
  );
}
