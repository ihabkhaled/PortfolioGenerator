import type { ReactElement } from 'react';

import { Input, Label, Textarea } from '@/packages/ui-primitives';

import { editorClasses } from '../constants/editor-style.constants';
import type { SeoFieldsProps } from '../types/editor-field.types';

/**
 * Search metadata, including the opt-out.
 *
 * Someone job-hunting quietly needs to be able to publish a URL they can share
 * without it appearing in search results for their name. That is a real and
 * common need, so it is a checkbox rather than a support request.
 */
export function SeoFields(props: Readonly<SeoFieldsProps>): ReactElement {
  return (
    <section className={editorClasses.section}>
      <div className={editorClasses.sectionHead}>
        <h2 className={editorClasses.sectionTitle}>{props.labels.seoTitle}</h2>
      </div>
      <p className={editorClasses.sectionHint}>{props.labels.seoHint}</p>

      <div className={editorClasses.fieldGrid}>
        <div className={editorClasses.fieldWide}>
          <Label htmlFor="seo-title">{props.labels.seoTitleField}</Label>
          <Input
            id="seo-title"
            value={props.title}
            maxLength={120}
            onChange={props.onTitleChange}
          />
        </div>

        <div className={editorClasses.fieldWide}>
          <Label htmlFor="seo-description">{props.labels.seoDescriptionField}</Label>
          <Textarea
            id="seo-description"
            value={props.description}
            maxLength={320}
            rows={3}
            onChange={props.onDescriptionChange}
          />
        </div>

        <div className={editorClasses.fieldWide}>
          <Label htmlFor="seo-indexable">
            <input
              id="seo-indexable"
              type="checkbox"
              checked={props.isIndexable}
              onChange={props.onIndexableChange}
            />
            {props.labels.indexable}
          </Label>
        </div>
      </div>
    </section>
  );
}
