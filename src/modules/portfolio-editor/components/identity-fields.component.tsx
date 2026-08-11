import type { ReactElement } from 'react';

import { Input, Label, Textarea } from '@/packages/ui-primitives';

import { editorClasses } from '../constants/editor-style.constants';
import { IDENTITY_DISPLAY_NAME_LABEL_ID } from '../constants/editor.constants';
import type { IdentityFieldsProps } from '../types/editor-field.types';

import { RequiredFieldLabel } from './required-field-label.component';

export function IdentityFields(props: Readonly<IdentityFieldsProps>): ReactElement {
  return (
    <section className={editorClasses.section}>
      <div className={editorClasses.sectionHead}>
        <h2 className={editorClasses.sectionTitle}>{props.labels.identityTitle}</h2>
      </div>
      <p className={editorClasses.sectionHint}>{props.labels.identityHint}</p>

      <div className={editorClasses.fieldGrid}>
        <div className={editorClasses.field}>
          <RequiredFieldLabel
            htmlFor="identity-display-name"
            label={props.labels.displayName}
            requiredLabel={props.labels.required}
          />
          <Input
            id="identity-display-name"
            value={props.displayName}
            maxLength={120}
            required
            aria-required
            aria-labelledby={IDENTITY_DISPLAY_NAME_LABEL_ID}
            onChange={props.onDisplayNameChange}
          />
        </div>

        <div className={editorClasses.field}>
          <Label htmlFor="identity-tagline">{props.labels.tagline}</Label>
          <Input
            id="identity-tagline"
            value={props.tagline}
            maxLength={180}
            onChange={props.onTaglineChange}
          />
        </div>

        <div className={editorClasses.field}>
          <Label htmlFor="identity-availability-note">{props.labels.availabilityNote}</Label>
          <Input
            id="identity-availability-note"
            value={props.availabilityNote}
            maxLength={320}
            onChange={props.onAvailabilityNoteChange}
          />
        </div>

        <div className={editorClasses.field}>
          <Label htmlFor="identity-availability-enabled">
            <input
              id="identity-availability-enabled"
              type="checkbox"
              checked={props.availabilityEnabled}
              onChange={props.onAvailabilityEnabledChange}
            />
            {props.labels.availabilityEnabled}
          </Label>
        </div>

        <div className={editorClasses.field}>
          <Label htmlFor="identity-headline">{props.labels.headline}</Label>
          <Input
            id="identity-headline"
            value={props.headline}
            maxLength={180}
            onChange={props.onHeadlineChange}
          />
        </div>

        <div className={editorClasses.field}>
          <Label htmlFor="identity-location">{props.labels.location}</Label>
          <Input
            id="identity-location"
            value={props.location}
            maxLength={160}
            onChange={props.onLocationChange}
          />
        </div>

        <div className={editorClasses.field}>
          <Label htmlFor="identity-nationality">{props.labels.nationality}</Label>
          <Input
            id="identity-nationality"
            value={props.nationality}
            maxLength={160}
            onChange={props.onNationalityChange}
          />
        </div>

        <div className={editorClasses.field}>
          <Label htmlFor="identity-military-status">{props.labels.militaryStatus}</Label>
          <Input
            id="identity-military-status"
            value={props.militaryStatus}
            maxLength={240}
            onChange={props.onMilitaryStatusChange}
          />
        </div>

        <div className={editorClasses.fieldWide}>
          <Label htmlFor="identity-summary">{props.labels.summary}</Label>
          <Textarea
            id="identity-summary"
            value={props.summary}
            maxLength={3000}
            rows={6}
            onChange={props.onSummaryChange}
          />
        </div>

        <div className={editorClasses.fieldWide}>
          <Label htmlFor="identity-cover-letter">{props.labels.coverLetter}</Label>
          <Textarea
            id="identity-cover-letter"
            value={props.coverLetter}
            maxLength={12_000}
            rows={10}
            onChange={props.onCoverLetterChange}
          />
        </div>
      </div>
    </section>
  );
}
