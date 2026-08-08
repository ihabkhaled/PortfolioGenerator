import type { ReactElement } from 'react';

import { heroClasses } from '../constants/marketing-style.constants';
import type { LandingHeroProps } from '../types/marketing.types';

/** Claim on the left, evidence on the right. No typing effects, no particles. */
export function LandingHero(props: Readonly<LandingHeroProps>): ReactElement {
  return (
    <div className={heroClasses.wrapper}>
      <div className={heroClasses.grid} aria-hidden />
      <div className={heroClasses.inner}>
        <div className={heroClasses.content}>
          <p className={heroClasses.eyebrow}>{props.eyebrow}</p>
          <h1 className={heroClasses.title}>{props.title}</h1>
          <p className={heroClasses.lead}>{props.lead}</p>
          <p className={heroClasses.supporting}>{props.supporting}</p>
          <div className={heroClasses.actions}>
            {props.primaryAction}
            {props.secondaryAction}
          </div>
        </div>
        <div className={heroClasses.aside}>{props.aside}</div>
      </div>
    </div>
  );
}
