import type { ReactElement } from 'react';

import { contactClasses } from '../constants/template-style.constants';
import type { ContactSectionProps } from '../types/section-props.types';

export function ContactSection(props: Readonly<ContactSectionProps>): ReactElement {
  return (
    <div className={contactClasses.panel}>
      <dl className={contactClasses.rows}>
        {props.rows.map((row) => (
          <div key={row.id} className={contactClasses.row}>
            <dt className={contactClasses.label}>{row.label}</dt>
            <dd className={contactClasses.value}>{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className={contactClasses.links}>{props.links}</div>
    </div>
  );
}
