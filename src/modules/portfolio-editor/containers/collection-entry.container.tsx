'use client';
// client-boundary-reason: collection field controls mutate the local draft before it is saved.

import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { ChevronDownIcon, ChevronUpIcon } from '@/packages/icons';
import { Button, Input, Label, Select, Textarea } from '@/packages/ui-primitives';

import { RequiredFieldLabel } from '../components/required-field-label.component';
import { editorClasses } from '../constants/editor-style.constants';
import {
  EDITOR_COLLECTION_FIELDS,
  EDITOR_SKILL_TIERS,
  EDITOR_SOCIAL_KINDS,
} from '../constants/editor.constants';
import {
  collectionBooleanFieldValue,
  collectionTextFieldValue,
  moveCollectionItem,
  removeCollectionItem,
  setCollectionField,
} from '../helpers/document-edit.helper';
import type { CollectionEntryProps } from '../types/collection-manager.types';

export function CollectionEntryContainer(props: Readonly<CollectionEntryProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.editor);
  const { collectionKey: key, document, item } = props;

  return (
    <div className={editorClasses.entry}>
      <div className={editorClasses.fieldGrid}>
        {EDITOR_COLLECTION_FIELDS[key].map((field) => {
          const id = `${key}-${item.id}-${field.name}`;
          const label = t(`collections.fields.${field.name}`);
          const fieldLabel =
            field.required === true ? (
              <RequiredFieldLabel htmlFor={id} label={label} requiredLabel={t('issues.required')} />
            ) : (
              <Label htmlFor={id}>{label}</Label>
            );
          const requiredLabelId = field.required === true ? `${id}-label` : undefined;
          if (field.kind === 'boolean') {
            const checked = collectionBooleanFieldValue(item, field.name);
            return (
              <div key={field.name} className={editorClasses.field}>
                {fieldLabel}
                <Input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  required={field.required}
                  aria-required={field.required}
                  aria-labelledby={requiredLabelId}
                  onChange={(event) => {
                    props.onChange(
                      setCollectionField(document, key, item.id, field.name, event.target.checked),
                    );
                  }}
                />
              </div>
            );
          }
          const value = collectionTextFieldValue(item, field.name);
          if (field.kind === 'month') {
            return (
              <div key={field.name} className={editorClasses.field}>
                {fieldLabel}
                <Input
                  id={id}
                  type="month"
                  value={value}
                  required={field.required}
                  aria-required={field.required}
                  aria-labelledby={requiredLabelId}
                  onChange={(event) => {
                    props.onChange(
                      setCollectionField(document, key, item.id, field.name, event.target.value),
                    );
                  }}
                />
              </div>
            );
          }
          if (field.kind === 'social-kind' || field.kind === 'skill-tier') {
            const options = field.kind === 'social-kind' ? EDITOR_SOCIAL_KINDS : EDITOR_SKILL_TIERS;
            const labelPrefix = field.kind === 'social-kind' ? 'socialKinds' : 'skillTiers';
            return (
              <div key={field.name} className={editorClasses.field}>
                {fieldLabel}
                <Select
                  id={id}
                  value={value}
                  required={field.required}
                  aria-required={field.required}
                  aria-labelledby={requiredLabelId}
                  onChange={(event) => {
                    props.onChange(
                      setCollectionField(document, key, item.id, field.name, event.target.value),
                    );
                  }}
                >
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {t(`collections.${labelPrefix}.${option}`)}
                    </option>
                  ))}
                </Select>
              </div>
            );
          }
          const isMultiline = ['textarea', 'list', 'project-content', 'project-links'].includes(
            field.kind,
          );
          if (isMultiline) {
            return (
              <div key={field.name} className={editorClasses.fieldWide}>
                {fieldLabel}
                <Textarea
                  id={id}
                  value={value}
                  required={field.required}
                  aria-required={field.required}
                  aria-labelledby={requiredLabelId}
                  onChange={(event) => {
                    const isList = ['list', 'project-content', 'project-links'].includes(
                      field.kind,
                    );
                    const next = isList
                      ? event.target.value
                          .split('\n')
                          .map((entry) => entry.trim())
                          .filter(Boolean)
                      : event.target.value;
                    props.onChange(setCollectionField(document, key, item.id, field.name, next));
                  }}
                />
              </div>
            );
          }
          return (
            <div key={field.name} className={editorClasses.field}>
              {fieldLabel}
              <Input
                id={id}
                value={value}
                required={field.required}
                aria-required={field.required}
                aria-labelledby={requiredLabelId}
                onChange={(event) => {
                  props.onChange(
                    setCollectionField(document, key, item.id, field.name, event.target.value),
                  );
                }}
              />
            </div>
          );
        })}
      </div>
      <div className={editorClasses.entryActions}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={t('collections.moveUp')}
          disabled={props.index === 0}
          onClick={() => {
            props.onChange(moveCollectionItem(document, key, props.index, props.index - 1));
          }}
        >
          <ChevronUpIcon aria-hidden size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={t('collections.moveDown')}
          disabled={props.index === document[key].length - 1}
          onClick={() => {
            props.onChange(moveCollectionItem(document, key, props.index, props.index + 1));
          }}
        >
          <ChevronDownIcon aria-hidden size={16} />
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => {
            props.onChange(removeCollectionItem(document, key, item.id));
          }}
        >
          {t('collections.remove')}
        </Button>
      </div>
    </div>
  );
}
