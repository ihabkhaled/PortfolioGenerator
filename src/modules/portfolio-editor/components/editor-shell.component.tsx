import type { ReactElement } from 'react';

import { editorClasses } from '../constants/editor-style.constants';
import type { EditorShellProps } from '../types/editor-view.types';

/** Forms on the left, live preview on the right. */
export function EditorShell(props: Readonly<EditorShellProps>): ReactElement {
  return (
    <div className={editorClasses.shell}>
      <header className={editorClasses.header}>
        <div className={editorClasses.headerMain}>
          <h1 className={editorClasses.title}>{props.title}</h1>
          <p className={editorClasses.subtitle}>{props.subtitle}</p>
        </div>
        <div className={editorClasses.headerActions}>{props.actions}</div>
      </header>

      <div className={editorClasses.panes}>
        <div className={editorClasses.formPane}>{props.forms}</div>
        <div className={editorClasses.previewPane}>
          <div className={editorClasses.previewFrame}>{props.preview}</div>
        </div>
      </div>
    </div>
  );
}
