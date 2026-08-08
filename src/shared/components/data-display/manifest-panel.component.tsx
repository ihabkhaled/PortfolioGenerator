import type { ReactElement } from 'react';

import type { ManifestPanelProps } from '../types/shared-component.types';

import { manifestClasses } from './section.variants';

/**
 * Label/value rows in a bordered panel. Rendered as a definition list because
 * that is what it is — a screen reader announcing "Location, Cairo" is the
 * whole point of the motif.
 */
export function ManifestPanel(props: Readonly<ManifestPanelProps>): ReactElement {
  return (
    <dl className={manifestClasses.panel} aria-label={props.ariaLabel}>
      {props.rows.map((row) => (
        <div key={row.id} className={manifestClasses.row}>
          <dt className={manifestClasses.label}>{row.label}</dt>
          <dd className={row.mono === true ? manifestClasses.valueMono : manifestClasses.value}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
