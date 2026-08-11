import type { ReactElement } from 'react';

import { ChevronDownIcon, ChevronUpIcon } from '@/packages/icons';
import { Button } from '@/packages/ui-primitives';

import { editorClasses } from '../constants/editor-style.constants';
import type { SectionListProps } from '../types/section-list.types';

/**
 * Section order and visibility.
 *
 * Move-up/move-down buttons rather than drag-and-drop. Drag is nicer with a
 * mouse and unusable without one, and reordering is not an optional flourish
 * here — it is how a user decides what a reader sees first. Buttons are
 * keyboard-operable, screen-reader-announceable and testable, which is worth
 * more than the gesture.
 */
export function SectionList(props: Readonly<SectionListProps>): ReactElement {
  return (
    <section id="editor-sections-list" className={editorClasses.section} tabIndex={-1}>
      <div className={editorClasses.sectionHead}>
        <h2 className={editorClasses.sectionTitle}>{props.title}</h2>
      </div>
      <p className={editorClasses.sectionHint}>{props.hint}</p>

      <ul className={editorClasses.collection}>
        {props.sections.map((section) => (
          <li key={section.id} className={editorClasses.entry}>
            <div className={editorClasses.entryHead}>
              <span className={editorClasses.entryTitle}>{section.label}</span>
              <div className={editorClasses.entryActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={section.moveUpLabel}
                  disabled={section.isFirst}
                  onClick={section.onMoveUp}
                >
                  <ChevronUpIcon aria-hidden size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={section.moveDownLabel}
                  disabled={section.isLast}
                  onClick={section.onMoveDown}
                >
                  <ChevronDownIcon aria-hidden size={16} />
                </Button>
                <Button variant="secondary" size="sm" onClick={section.onToggleVisibility}>
                  {section.visibilityLabel}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
