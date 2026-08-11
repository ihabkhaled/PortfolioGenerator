import type { ReactElement } from 'react';

import { CloseIcon } from '@/packages/icons';

import type { ErrorStateProps } from '../types/shared-component.types';

import { feedbackClasses } from './feedback.variants';

/**
 * A floating, dismissible piece of information — install prompts, update
 * offers — that is not a fault. `role="status"` (implicit `aria-live="polite"`,
 * `aria-atomic="true"`) announces it without interrupting the reader the way
 * `role="alert"` (assertive, for urgent, time-sensitive failures) would.
 * Shares its prop shape with `ErrorState` — title, description, an optional
 * action, an optional dismiss — because the two differ in urgency and
 * presentation, not in what they need from a caller.
 */
export function NoticeState(props: Readonly<ErrorStateProps>): ReactElement {
  return (
    <div className={feedbackClasses.noticePanel} role="status">
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
      <div className={feedbackClasses.noticeBody}>
        <div className={feedbackClasses.noticeText}>
          <p className={feedbackClasses.noticeTitle}>{props.title}</p>
          <p className={feedbackClasses.noticeDescription}>{props.description}</p>
        </div>
        {props.action}
      </div>
    </div>
  );
}
