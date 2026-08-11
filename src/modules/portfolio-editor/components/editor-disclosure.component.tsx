import type { ReactElement } from 'react';

import { editorClasses } from '../constants/editor-style.constants';
import type { EditorDisclosureProps } from '../types/editor.types';

export function EditorDisclosure(props: Readonly<EditorDisclosureProps>): ReactElement {
  return (
    <details id={props.id} className={editorClasses.disclosure} open={props.defaultOpen}>
      <summary className={editorClasses.disclosureSummary}>
        <span className={editorClasses.disclosureTitle}>{props.title}</span>
        <span className={editorClasses.disclosureMeta}>{props.summary}</span>
      </summary>
      <div className={editorClasses.disclosureBody}>{props.children}</div>
    </details>
  );
}
