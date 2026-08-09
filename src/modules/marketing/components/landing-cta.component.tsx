import type { ReactElement } from 'react';

import { ctaClasses } from '../constants/marketing-style.constants';
import type { LandingCtaProps } from '../types/marketing.types';

export function LandingCta(props: Readonly<LandingCtaProps>): ReactElement {
  return (
    <div className={ctaClasses.panel}>
      <div className={ctaClasses.copy}>
        <h2 className={ctaClasses.title}>{props.title}</h2>
        <p className={ctaClasses.description}>{props.description}</p>
      </div>
      <div className={ctaClasses.actions}>{props.actions}</div>
    </div>
  );
}
