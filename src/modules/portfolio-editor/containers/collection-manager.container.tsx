'use client';
// client-boundary-reason: collection CRUD mutates the local draft before the shared save action validates it.

import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button, Input, Label } from '@/packages/ui-primitives';

import { editorClasses } from '../constants/editor-style.constants';
import { EDITOR_COLLECTION_KEYS } from '../constants/editor.constants';
import { appendEmptyCollectionItem, setInterests } from '../helpers/document-edit.helper';
import type { CollectionManagerProps } from '../types/collection-manager.types';

import { CollectionEntryContainer } from './collection-entry.container';

export function CollectionManagerContainer(props: Readonly<CollectionManagerProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.editor);
  return (
    <section className={editorClasses.section}>
      <h2 className={editorClasses.sectionTitle}>{t('collections.title')}</h2>
      <p className={editorClasses.sectionHint}>{t('collections.hint')}</p>
      {EDITOR_COLLECTION_KEYS.map((key) => (
        <section key={key} className={editorClasses.collection}>
          <div className={editorClasses.sectionHead}>
            <h3 className={editorClasses.entryTitle}>{t(`collections.${key}`)}</h3>
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
          {props.document[key].map((item, index) => (
            <CollectionEntryContainer
              key={item.id}
              document={props.document}
              onChange={props.onChange}
              collectionKey={key}
              item={item}
              index={index}
            />
          ))}
        </section>
      ))}
      <div className={editorClasses.field}>
        <Label htmlFor="portfolio-interests">{t('collections.interests')}</Label>
        <Input
          id="portfolio-interests"
          value={props.document.interests.join(', ')}
          onChange={(event) => {
            props.onChange(setInterests(props.document, event.target.value.split(',')));
          }}
        />
      </div>
    </section>
  );
}
