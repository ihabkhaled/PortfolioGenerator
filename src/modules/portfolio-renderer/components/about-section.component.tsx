import type { ReactElement } from 'react';

import { aboutClasses } from '../constants/template-style.constants';
import type { AboutSectionProps } from '../types/section-props.types';

export function AboutSection(props: Readonly<AboutSectionProps>): ReactElement {
  return (
    <div className={aboutClasses.prose}>
      {props.paragraphs.map((paragraph) => (
        <p key={paragraph} className={aboutClasses.paragraph}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
