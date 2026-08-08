import type { ReactElement } from 'react';

import { Badge } from '@/packages/ui-primitives';

import { timelineClasses } from '../constants/template-style.constants';
import type { TimelineSectionProps } from '../types/section-props.types';

/**
 * Experience as a single ordered list of hairline-separated rows rather than
 * cards: a career is a sequence, and cards imply parallel, unrelated items.
 */
export function TimelineSection(props: Readonly<TimelineSectionProps>): ReactElement {
  return (
    <div className={timelineClasses.list}>
      {props.entries.map((entry) => (
        <article key={entry.id} className={timelineClasses.item}>
          <div className={timelineClasses.head}>
            <div>
              <h3 className={timelineClasses.organization}>{entry.organization}</h3>
              <p className={timelineClasses.role}>{entry.role}</p>
            </div>
            {entry.dateRange === '' ? null : (
              <p className={timelineClasses.dateRange}>{entry.dateRange}</p>
            )}
          </div>
          {entry.summary === null ? null : (
            <p className={timelineClasses.summary}>{entry.summary}</p>
          )}
          {entry.highlights.length === 0 ? null : (
            <ul className={timelineClasses.highlights}>
              {entry.highlights.map((highlight) => (
                <li key={highlight} className={timelineClasses.highlight}>
                  <span className={timelineClasses.highlightMarker} aria-hidden />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}
          {entry.tags.length === 0 ? null : (
            <div className={timelineClasses.tags}>
              {entry.tags.map((tag) => (
                <Badge key={tag} tone="neutral">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
