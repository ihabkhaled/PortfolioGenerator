import type { ReactElement } from 'react';

import { supplementalClasses } from '../constants/template-style.constants';
import type { SupplementalSectionProps } from '../types/section-props.types';

export function SupplementalSection(props: SupplementalSectionProps): ReactElement {
  return (
    <section className={supplementalClasses.section}>
      <h3 className={supplementalClasses.heading}>{props.title}</h3>
      {props.children}
    </section>
  );
}
