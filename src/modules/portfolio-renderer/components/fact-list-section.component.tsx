import type { ReactElement } from 'react';

import { factListClasses } from '../constants/template-style.constants';
import type { FactListSectionProps } from '../types/section-props.types';

/**
 * Shared by education, certifications and languages: three collections with
 * the same shape (title, qualifier, date, optional credential link) and no
 * reason to look different from each other.
 */
export function FactListSection(props: Readonly<FactListSectionProps>): ReactElement {
  return (
    <div className={factListClasses.list}>
      {props.entries.map((entry) => (
        <article key={entry.id} className={factListClasses.item}>
          <div className={factListClasses.head}>
            <div>
              <h3 className={factListClasses.title}>{entry.title}</h3>
              {entry.subtitle === null ? null : (
                <p className={factListClasses.subtitle}>{entry.subtitle}</p>
              )}
            </div>
            {entry.meta === null || entry.meta === '' ? null : (
              <p className={factListClasses.meta}>{entry.meta}</p>
            )}
          </div>
          {entry.detail === null ? null : <p className={factListClasses.detail}>{entry.detail}</p>}
          {props.renderLink(entry)}
        </article>
      ))}
    </div>
  );
}
