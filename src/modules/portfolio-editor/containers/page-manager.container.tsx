'use client';
// client-boundary-reason: page creation inputs and immutable page mutations are local draft state.

import { useState, type ReactElement, type SyntheticEvent } from 'react';

import { PrivatePagePasswordContainer } from '@/modules/private-page-access/private-page-access-ui';
import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { ChevronDownIcon, ChevronUpIcon } from '@/packages/icons';
import { Button, Input, Label, Textarea } from '@/packages/ui-primitives';

import { editorClasses } from '../constants/editor-style.constants';
import { createPage, editPage, movePage, removePage } from '../helpers/document-edit.helper';
import type { PageManagerProps } from '../types/page-manager.types';

export function PageManagerContainer(props: Readonly<PageManagerProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.editor);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [navLabel, setNavLabel] = useState('');

  function handleCreate(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (slug.trim() === '' || title.trim() === '' || navLabel.trim() === '') return;
    props.onChange(
      createPage(props.document, {
        id: `page-${globalThis.crypto.randomUUID()}`,
        slug: slug.trim(),
        title: title.trim(),
        navLabel: navLabel.trim(),
      }),
    );
    setSlug('');
    setTitle('');
    setNavLabel('');
  }

  return (
    <section className={editorClasses.section}>
      <h2 className={editorClasses.sectionTitle}>{t('pages.title')}</h2>
      <p className={editorClasses.sectionHint}>{t('pages.hint')}</p>
      <form className={editorClasses.collection} onSubmit={handleCreate}>
        <div className={editorClasses.fieldGrid}>
          <div className={editorClasses.field}>
            <Label htmlFor="new-page-title">{t('pages.pageTitle')}</Label>
            <Input
              id="new-page-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
            />
          </div>
          <div className={editorClasses.field}>
            <Label htmlFor="new-page-nav">{t('pages.navLabel')}</Label>
            <Input
              id="new-page-nav"
              value={navLabel}
              onChange={(event) => {
                setNavLabel(event.target.value);
              }}
            />
          </div>
          <div className={editorClasses.fieldWide}>
            <Label htmlFor="new-page-slug">{t('pages.slug')}</Label>
            <Input
              id="new-page-slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
              }}
            />
          </div>
        </div>
        <Button type="submit">{t('pages.add')}</Button>
      </form>
      <ul className={editorClasses.collection}>
        {props.document.pages.map((page, index) => (
          <li key={page.id} className={editorClasses.entry}>
            <div className={editorClasses.fieldGrid}>
              <div className={editorClasses.field}>
                <Label htmlFor={`${page.id}-title`}>{t('pages.pageTitle')}</Label>
                <Input
                  id={`${page.id}-title`}
                  value={page.title}
                  onChange={(event) => {
                    props.onChange(
                      editPage(props.document, page.id, { title: event.target.value }),
                    );
                  }}
                />
              </div>
              <div className={editorClasses.field}>
                <Label htmlFor={`${page.id}-nav`}>{t('pages.navLabel')}</Label>
                <Input
                  id={`${page.id}-nav`}
                  value={page.navLabel}
                  onChange={(event) => {
                    props.onChange(
                      editPage(props.document, page.id, { navLabel: event.target.value }),
                    );
                  }}
                />
              </div>
              <div className={editorClasses.field}>
                <Label htmlFor={`${page.id}-slug`}>{t('pages.slug')}</Label>
                <Input
                  id={`${page.id}-slug`}
                  value={page.slug}
                  disabled={page.slug === ''}
                  onChange={(event) => {
                    props.onChange(editPage(props.document, page.id, { slug: event.target.value }));
                  }}
                />
              </div>
              <div className={editorClasses.fieldWide}>
                <Label htmlFor={`${page.id}-description`}>{t('pages.description')}</Label>
                <Textarea
                  id={`${page.id}-description`}
                  value={page.description ?? ''}
                  onChange={(event) => {
                    props.onChange(
                      editPage(props.document, page.id, {
                        description: event.target.value.trim() === '' ? null : event.target.value,
                      }),
                    );
                  }}
                />
              </div>
            </div>
            {page.slug === '' ? null : (
              <PrivatePagePasswordContainer
                portfolioId={props.portfolioId}
                pageId={page.id}
                expectedVersion={props.expectedVersion}
                currentVisibility={page.visibility}
                onVersionChange={props.onVersionChange}
                labels={{
                  visibility: t('pages.privateAccess.visibility'),
                  publicOption: t('pages.privateAccess.public'),
                  privateOption: t('pages.privateAccess.private'),
                  password: t('pages.privateAccess.password'),
                  passwordHint: t('pages.privateAccess.passwordHint'),
                  submit: t('pages.privateAccess.submit'),
                  success: t('pages.privateAccess.success'),
                  errors: {
                    'invalid-input': t('pages.privateAccess.errors.invalidInput'),
                    'not-found': t('pages.privateAccess.errors.notFound'),
                    'version-conflict': t('pages.privateAccess.errors.versionConflict'),
                  },
                }}
              />
            )}
            <div className={editorClasses.entryActions}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={t('pages.moveUp')}
                disabled={index === 0}
                onClick={() => {
                  props.onChange(movePage(props.document, index, index - 1));
                }}
              >
                <ChevronUpIcon aria-hidden size={16} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={t('pages.moveDown')}
                disabled={index === props.document.pages.length - 1}
                onClick={() => {
                  props.onChange(movePage(props.document, index, index + 1));
                }}
              >
                <ChevronDownIcon aria-hidden size={16} />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  props.onChange(editPage(props.document, page.id, { visible: !page.visible }));
                }}
              >
                {t(page.visible ? 'pages.hide' : 'pages.show')}
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={page.slug === ''}
                onClick={() => {
                  props.onChange(removePage(props.document, page.id));
                }}
              >
                {t('pages.remove')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
