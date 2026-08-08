import type { ReactElement } from 'react';

import { Input, Label } from '@/packages/ui-primitives';

import { editorClasses } from '../constants/editor-style.constants';
import type { ContactFieldsProps } from '../types/editor-field.types';

/**
 * Contact details, each with its own visibility switch.
 *
 * Storing a phone number and publishing it are different decisions, and the
 * editor makes that explicit rather than treating "we extracted it" as consent
 * to put it on a public page.
 */
export function ContactFields(props: Readonly<ContactFieldsProps>): ReactElement {
  return (
    <section className={editorClasses.section}>
      <div className={editorClasses.sectionHead}>
        <h2 className={editorClasses.sectionTitle}>{props.labels.contactTitle}</h2>
      </div>
      <p className={editorClasses.sectionHint}>{props.labels.contactHint}</p>

      <div className={editorClasses.fieldGrid}>
        <div className={editorClasses.field}>
          <Label htmlFor="contact-email">{props.labels.email}</Label>
          <Input
            id="contact-email"
            type="email"
            value={props.email}
            maxLength={320}
            onChange={props.onEmailChange}
          />
          <Label htmlFor="contact-email-visible">
            <input
              id="contact-email-visible"
              type="checkbox"
              checked={props.isEmailVisible}
              onChange={props.onEmailVisibilityChange}
            />
            {props.labels.showPublicly}
          </Label>
        </div>

        <div className={editorClasses.field}>
          <Label htmlFor="contact-phone">{props.labels.phone}</Label>
          <Input
            id="contact-phone"
            type="tel"
            value={props.phone}
            maxLength={80}
            onChange={props.onPhoneChange}
          />
          <Label htmlFor="contact-phone-visible">
            <input
              id="contact-phone-visible"
              type="checkbox"
              checked={props.isPhoneVisible}
              onChange={props.onPhoneVisibilityChange}
            />
            {props.labels.showPublicly}
          </Label>
        </div>
      </div>
    </section>
  );
}
