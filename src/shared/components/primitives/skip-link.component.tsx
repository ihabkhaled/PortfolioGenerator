import type { ReactElement } from 'react';

import type { SkipLinkProps } from '../types/shared-component.types';

import { skipLinkClasses } from './skip-link.variants';

/**
 * Visually hidden until focused. A keyboard user should not have to tab
 * through the whole header on every page to reach the content.
 */
export function SkipLink(props: Readonly<SkipLinkProps>): ReactElement {
  return (
    <a href={props.targetHref} className={skipLinkClasses.link}>
      {props.label}
    </a>
  );
}
