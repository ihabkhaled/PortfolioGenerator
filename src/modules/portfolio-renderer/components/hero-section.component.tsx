import type { ReactElement } from 'react';

import { heroClasses } from '../constants/template-style.constants';
import type { HeroSectionProps } from '../types/section-props.types';

/**
 * The claim, then the evidence. No typing animation, no particle field: the
 * subject of the page is a person's professional record, and decoration that
 * delays reading it works against them.
 */
export function HeroSection(props: Readonly<HeroSectionProps>): ReactElement {
  return (
    <div className={heroClasses.wrapper}>
      <div className={heroClasses.grid} aria-hidden />
      <div className={heroClasses.inner}>
        <div className={heroClasses.content}>
          {props.portrait}
          {props.availabilityLabel === null ? null : (
            <p className={heroClasses.availability}>
              <span className={heroClasses.availabilityDot} aria-hidden />
              {props.availabilityLabel}
            </p>
          )}
          <h1 className={heroClasses.name}>{props.displayName}</h1>
          {props.headline === null ? null : (
            <p className={heroClasses.headline}>{props.headline}</p>
          )}
          {props.summary === null ? null : <p className={heroClasses.summary}>{props.summary}</p>}
        </div>
        {props.aside === null && props.links === null ? null : (
          <div className={heroClasses.aside}>
            {props.aside}
            {props.links === null ? null : (
              <div className={heroClasses.socialRow} data-testid="hero-social-links">
                {props.links}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
