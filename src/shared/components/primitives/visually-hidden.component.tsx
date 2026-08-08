import type { ReactElement } from 'react';

import type { VisuallyHiddenProps } from '../types/shared-component.types';

/** Content for assistive technology only. */
export function VisuallyHidden(props: Readonly<VisuallyHiddenProps>): ReactElement {
  return <span className="sr-only">{props.children}</span>;
}
