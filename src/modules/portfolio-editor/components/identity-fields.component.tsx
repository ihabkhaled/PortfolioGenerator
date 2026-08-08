import type { ReactElement } from 'react';

import { Input, Label, Textarea } from '@/packages/ui-primitives';

import { editorClasses } from '../constants/editor-style.constants';
import type { IdentityFieldsProps } from '../types/editor-field.types';

export function IdentityFields(props: Readonly<IdentityFieldsProps>): ReactElement {
  return (
    <section className={editorClasses.section}>
      <div className={editorClasses.sectionHead}>
        <h2 className={editorClasses.sectionTitle}>{props.labels.identityTitle}</h2>
      </div>
      <p className={editorClasses.sectionHint}>{props.labels.identityHint}</p>

      <div className={editorClasses.fieldGrid}>
        <div className={editorClasses.field}>
          <Label htmlFor="identity-display-name">{props.labels.displayName}</Label>
          <Input
            id="identity-display-name"
            value={props.displayName}
            maxLength={120}
            onChange={props.onDisplayNameChange}
          />
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
      </div>
    </section>
  );
}
