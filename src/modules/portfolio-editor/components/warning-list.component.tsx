import type { ReactElement } from 'react';

import { WarningIcon } from '@/packages/icons';

import { editorClasses } from '../constants/editor-style.constants';
import type { WarningListProps } from '../types/editor-view.types';

/**
 * What the extractor was unsure about.
 *
 * Shown as a short, plain list with the field path attached — not as model
 * reasoning, and not as a scary banner. These are the handful of values most
 * worth a second look before someone's name goes on them.
 */
export function WarningList(props: Readonly<WarningListProps>): ReactElement | null {
  if (props.warnings.length === 0) {
    return null;
  }

  return (
    <section className={editorClasses.section}>
      <h2 className={editorClasses.sectionTitle}>{props.title}</h2>
      <ul className={editorClasses.warningList}>
        {props.warnings.map((warning) => (
          <li key={`${warning.code}-${warning.path}`} className={editorClasses.warning}>
            <WarningIcon aria-hidden size={16} />
            <span className={editorClasses.warningText}>{warning.message}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
