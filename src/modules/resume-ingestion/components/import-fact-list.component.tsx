import type { ReactElement } from 'react';

import { importClasses } from '../constants/import-style.constants';
import type { ImportFactListProps } from '../types/import-form-props.types';

/**
 * What happens to an uploaded CV, stated before the user uploads one.
 *
 * A privacy promise made after the fact is not a promise. This sits next to the
 * file picker so the answer to "where does this go" is on screen at the moment
 * someone is deciding whether to hand it over.
 */
export function ImportFactList(props: Readonly<ImportFactListProps>): ReactElement {
  return (
    <dl className={importClasses.facts}>
      {props.facts.map((fact) => (
        <div key={fact.id} className={importClasses.fact}>
          <dt className={importClasses.factLabel}>{fact.label}</dt>
          <dd className={importClasses.factValue}>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
