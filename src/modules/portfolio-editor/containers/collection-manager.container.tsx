'use client';
// client-boundary-reason: collection CRUD mutates the local draft before the shared save action validates it.

import { useEffect, useRef, useState, type ReactElement } from 'react';

import type { PortfolioDocument } from '@/modules/portfolio-document';
import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button, Input, Label } from '@/packages/ui-primitives';

import { EditorDisclosure } from '../components/editor-disclosure.component';
import { editorClasses } from '../constants/editor-style.constants';
import { EDITOR_COLLECTION_FIELDS, EDITOR_COLLECTION_KEYS } from '../constants/editor.constants';
import { appendEmptyCollectionItem, setInterests } from '../helpers/document-edit.helper';
import type { CollectionManagerProps } from '../types/collection-manager.types';

import { CollectionEntryContainer } from './collection-entry.container';

function entryTitle(item: object, fallback: string): string {
  const record = item as Readonly<Record<string, unknown>>;
  for (const key of ['name', 'title', 'label', 'organization', 'institution', 'quote', 'author']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim() !== '') return value;
  }
  return fallback;
}

export function CollectionManagerContainer(props: Readonly<CollectionManagerProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.editor);
  const [interests, setInterestsDraft] = useState(props.document.interests.join(', '));
  const editingInterests = useRef(false);

  useEffect(() => {
    if (!editingInterests.current) setInterestsDraft(props.document.interests.join(', '));
  }, [props.document.interests]);

  function synchronizeInterests(value: string): PortfolioDocument {
    const nextDocument = setInterests(props.document, value.split(','));
    props.onChange(nextDocument);
    return nextDocument;
  }
  return (
    <section className={editorClasses.section}>
      <h2 className={editorClasses.sectionTitle}>{t('collections.title')}</h2>
      <p className={editorClasses.sectionHint}>{t('collections.hint')}</p>
      {EDITOR_COLLECTION_KEYS.map((key) => (
        <EditorDisclosure
          key={key}
          id={`editor-collection-${key}`}
          title={t(`collections.${key}`)}
          summary={t('disclosures.items', { count: props.document[key].length })}
        >
          <div className={editorClasses.entryActions}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                props.onChange(
                  appendEmptyCollectionItem(
                    props.document,
                    key,
                    `${key}-${globalThis.crypto.randomUUID()}`,
                  ),
                );
              }}
            >
              {t('collections.add')}
            </Button>
          </div>
          {props.document[key].length === 0 ? (
            <p className={editorClasses.fieldHint}>{t(`collections.emptyHints.${key}`)}</p>
          ) : null}
          {props.document[key].map((item, index) => (
            <EditorDisclosure
              key={item.id}
              id={`editor-${key}-${item.id}`}
              title={entryTitle(item, t(`collections.${key}`))}
              summary={t('disclosures.items', { count: EDITOR_COLLECTION_FIELDS[key].length })}
            >
              <CollectionEntryContainer
                document={props.document}
                onChange={props.onChange}
                collectionKey={key}
                item={item}
                index={index}
              />
            </EditorDisclosure>
          ))}
        </EditorDisclosure>
      ))}
      <div className={editorClasses.field}>
        <Label htmlFor="portfolio-interests">{t('collections.interests')}</Label>
        <Input
          id="portfolio-interests"
          value={interests}
          onFocus={() => {
            editingInterests.current = true;
          }}
          onChange={(event) => {
            const value = event.target.value;
            setInterestsDraft(value);
            synchronizeInterests(value);
          }}
          onBlur={() => {
            editingInterests.current = false;
            setInterestsDraft(synchronizeInterests(interests).interests.join(', '));
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setInterestsDraft(synchronizeInterests(interests).interests.join(', '));
            }
          }}
        />
      </div>
    </section>
  );
}
