'use client';
// client-boundary-reason: issue navigation tracks the active issue and coordinates focus with native disclosures.

import { useEffect, useState, type ReactElement } from 'react';

import { Button } from '@/packages/ui-primitives';

import { editorClasses } from '../constants/editor-style.constants';
import { ARIA_LIVE_POLITE, EDITOR_ISSUE_MESSAGE_ID } from '../constants/editor.constants';
import {
  buildSafeIssueIdentifier,
  findIssueControls,
  focusEditorIssueTarget,
  setIssueControlState,
} from '../helpers/editor-issue-navigation.helper';
import type { EditorIssueNavigatorProps } from '../types/editor.types';

export function EditorIssueNavigatorContainer(
  props: Readonly<EditorIssueNavigatorProps>,
): ReactElement {
  const [current, setCurrent] = useState(-1);

  useEffect(() => {
    const controls = findIssueControls(props.targets);
    setIssueControlState(controls, EDITOR_ISSUE_MESSAGE_ID, true);
    return () => {
      setIssueControlState(controls, EDITOR_ISSUE_MESSAGE_ID, false);
    };
  }, [props.targets]);

  useEffect(() => {
    if (current < 0) return;
    const target = props.targets[current];
    if (target !== undefined) focusEditorIssueTarget(target);
  }, [current, props.targets]);

  const navigate = (direction: 1 | -1): void => {
    if (props.targets.length === 0) return;
    props.onNavigate?.();
    setCurrent((value) => (value + direction + props.targets.length) % props.targets.length);
  };
  const handlePrevious = (): void => {
    navigate(-1);
  };
  const handleNext = (): void => {
    navigate(1);
  };

  return (
    <div className={editorClasses.issueNavigator} aria-live={ARIA_LIVE_POLITE}>
      <span className={editorClasses.status}>{props.countLabel}</span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={props.targets.length === 0}
        onClick={handlePrevious}
      >
        {props.previousLabel}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={props.targets.length === 0}
        onClick={handleNext}
      >
        {props.nextLabel}
      </Button>
      <span id={EDITOR_ISSUE_MESSAGE_ID} className={editorClasses.issueMessage}>
        {current < 0 ? null : props.message}
      </span>
      {props.generalIssues.length === 0 ? null : (
        <div className={editorClasses.issueGeneral}>
          <h3 className={editorClasses.entryTitle}>{props.generalTitle}</h3>
          <ul className={editorClasses.warningList}>
            {props.generalIssues.map((issue) => (
              <li
                key={`${issue.code}-${issue.path.join('.')}`}
                className={editorClasses.issueMessage}
              >
                {props.generalTitle} · {buildSafeIssueIdentifier(issue)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
