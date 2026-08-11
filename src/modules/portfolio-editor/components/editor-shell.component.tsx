import type { ReactElement } from 'react';

import { Button } from '@/packages/ui-primitives';

import { editorClasses } from '../constants/editor-style.constants';
import type { EditorShellProps } from '../types/editor-view.types';

/**
 * Forms on the left, live preview on the right — at `lg` and up. Below that,
 * there is only room for one pane, so a segmented control picks which one is
 * visible; which pane is active is state the caller owns (a `.component.tsx`
 * file may not hold its own), passed down like every other prop here.
 */
export function EditorShell(props: Readonly<EditorShellProps>): ReactElement {
  return (
    <section className={editorClasses.shellWithDock} aria-label={props.title}>
      <header className={editorClasses.header}>
        <div className={editorClasses.headerMain}>
          <h1 className={editorClasses.title}>{props.title}</h1>
          <p className={editorClasses.subtitle}>{props.subtitle}</p>
        </div>
        <div className={editorClasses.headerActions}>{props.actions}</div>
      </header>

      <div className={editorClasses.mobileTabs}>
        <Button
          type="button"
          variant={props.showingPreview ? 'secondary' : 'primary'}
          size="sm"
          aria-pressed={!props.showingPreview}
          onClick={props.onEditClick}
        >
          {props.mobileEditLabel}
        </Button>
        <Button
          type="button"
          variant={props.showingPreview ? 'primary' : 'secondary'}
          size="sm"
          aria-pressed={props.showingPreview}
          onClick={props.onPreviewClick}
        >
          {props.mobilePreviewLabel}
        </Button>
      </div>

      <div className={editorClasses.panes}>
        <div
          className={
            props.showingPreview ? editorClasses.formPaneMobileHidden : editorClasses.formPane
          }
        >
          {props.forms}
        </div>
        <div
          className={
            props.showingPreview
              ? editorClasses.previewPaneMobileVisible
              : editorClasses.previewPane
          }
        >
          <div className={editorClasses.previewFrame}>{props.preview}</div>
        </div>
      </div>
    </section>
  );
}
