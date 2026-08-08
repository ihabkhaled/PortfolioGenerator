import type { ReactElement } from 'react';

import type { SectionProps } from '../types/shared-component.types';

import { sectionClasses } from './section.variants';

/**
 * One band of a page. The eyebrow sits in its own column on wide screens so a
 * reader scanning the left edge gets a table of contents for free.
 */
export function Section(props: Readonly<SectionProps>): ReactElement {
  return (
    <section className={sectionClasses.section} aria-labelledby={props.headingId}>
      <p className={sectionClasses.eyebrow}>{props.eyebrow}</p>
      <div className={sectionClasses.column}>
        <h2 id={props.headingId} className={sectionClasses.title}>
          {props.title}
        </h2>
        {props.lead ? <p className={sectionClasses.lead}>{props.lead}</p> : null}
        <div className={sectionClasses.body}>{props.children}</div>
      </div>
    </section>
  );
}
