import type { ReactElement } from 'react';

import { Input, Label, Select } from '@/packages/ui-primitives';

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
          {/*
            The country and the number are one answer, so they sit on one row.
            A number stored without its country renders as `100-156-8256`,
            which is unusable to anyone outside that country — and the reader
            has no way to tell which country it was.
          */}
          <div className={editorClasses.phoneRow}>
            <Select
              id="contact-phone-country"
              aria-label={props.labels.phoneCountry}
              value={props.phoneCountryIso ?? ''}
              onChange={props.onPhoneCountryChange}
            >
              <option value="">{props.labels.phoneCountryNone}</option>
              {props.countries.map((country) => (
                <option key={country.iso} value={country.iso}>
                  {country.dial} {country.name}
                </option>
              ))}
            </Select>
            <Input
              id="contact-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={props.phone}
              maxLength={40}
              onChange={props.onPhoneChange}
            />
          </div>
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
