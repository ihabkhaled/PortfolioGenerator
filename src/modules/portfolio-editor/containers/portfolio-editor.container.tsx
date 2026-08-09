'use client';
// client-boundary-reason: the editor holds an in-progress draft, a dirty flag
// and a save lifecycle, and re-renders the live preview on every keystroke.

import type { ReactElement } from 'react';

import { buildNavigation, findVisiblePage, HOME_PAGE_SLUG } from '@/modules/portfolio-document';
import { buildPortfolioLabels, PortfolioTemplate } from '@/modules/portfolio-renderer';
import { APP_LOCALE, I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { ErrorIcon } from '@/packages/icons';
import { Button } from '@/packages/ui-primitives';
import { sortCountriesByName } from '@/shared/utils/phone-number.util';

import { ContactFields } from '../components/contact-fields.component';
import { EditorShell } from '../components/editor-shell.component';
import { IdentityFields } from '../components/identity-fields.component';
import { SectionList } from '../components/section-list.component';
import { SeoFields } from '../components/seo-fields.component';
import { WarningList } from '../components/warning-list.component';
import { editorClasses } from '../constants/editor-style.constants';
import {
  moveSection,
  setContactVisibility,
  setEmailValue,
  setPhoneNumber,
  setIdentityField,
  setIndexable,
  setSectionVisibility,
  setSeoField,
} from '../helpers/document-edit.helper';
import { useDraftEditor } from '../hooks/use-draft-editor.hook';
import type { EditorContainerProps } from '../types/editor-view.types';
import type { SectionListEntry } from '../types/section-list.types';

export function PortfolioEditorContainer(props: Readonly<EditorContainerProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.editor);
  const tPortfolio = useAppTranslation(I18N_NAMESPACES.portfolio);
  const editor = useDraftEditor({
    portfolioId: props.portfolioId,
    initialDocument: props.initialDocument,
    initialVersion: props.initialVersion,
  });

  const { document } = editor;
  const home = findVisiblePage(document, HOME_PAGE_SLUG);
  const homePage = document.pages.find((page) => page.slug === HOME_PAGE_SLUG);

  const sections: readonly SectionListEntry[] =
    homePage === undefined
      ? []
      : homePage.sections.map((section, index) => ({
          id: section.id,
          label: tPortfolio(`sections.${section.type}`),
          visibilityLabel: t(section.visible ? 'sections.hide' : 'sections.show'),
          moveUpLabel: t('sections.moveUp'),
          moveDownLabel: t('sections.moveDown'),
          isFirst: index === 0,
          isLast: index === homePage.sections.length - 1,
          onMoveUp: () => {
            editor.update(moveSection(document, homePage.id, index, index - 1));
          },
          onMoveDown: () => {
            editor.update(moveSection(document, homePage.id, index, index + 1));
          },
          onToggleVisibility: () => {
            editor.update(
              setSectionVisibility(document, homePage.id, section.id, !section.visible),
            );
          },
        }));

  return (
    <EditorShell
      title={document.identity.displayName || t('untitled')}
      subtitle={t(editor.isDirty ? 'unsaved' : 'saved')}
      actions={
        <>
          <span className={editor.isDirty ? editorClasses.status : editorClasses.statusSaved}>
            {t(editor.isDirty ? 'unsaved' : 'saved')}
          </span>
          <Button onClick={editor.save} disabled={!editor.isDirty || editor.isSaving}>
            {t(editor.isSaving ? 'saving' : 'save')}
          </Button>
        </>
      }
      forms={
        <>
          {editor.error === null ? null : (
            <p className={editorClasses.error} role="alert">
              <ErrorIcon aria-hidden size={18} />
              <span className={editorClasses.errorText}>{t(editor.error)}</span>
            </p>
          )}

          <WarningList title={t('warningsTitle')} warnings={props.warnings} />

          <IdentityFields
            labels={props.labels}
            displayName={document.identity.displayName}
            headline={document.identity.headline ?? ''}
            summary={document.identity.summary ?? ''}
            location={document.identity.location ?? ''}
            onDisplayNameChange={(event) => {
              editor.update(setIdentityField(document, 'displayName', event.target.value));
            }}
            onHeadlineChange={(event) => {
              editor.update(setIdentityField(document, 'headline', event.target.value));
            }}
            onSummaryChange={(event) => {
              editor.update(setIdentityField(document, 'summary', event.target.value));
            }}
            onLocationChange={(event) => {
              editor.update(setIdentityField(document, 'location', event.target.value));
            }}
          />

          <ContactFields
            labels={props.labels}
            email={document.contact.email.value ?? ''}
            phone={document.contact.phone.nationalNumber ?? ''}
            isEmailVisible={document.contact.email.visible}
            isPhoneVisible={document.contact.phone.visible}
            onEmailChange={(event) => {
              editor.update(setEmailValue(document, event.target.value));
            }}
            onPhoneChange={(event) => {
              editor.update(
                setPhoneNumber(document, document.contact.phone.countryIso, event.target.value),
              );
            }}
            phoneCountryIso={document.contact.phone.countryIso}
            countries={sortCountriesByName(APP_LOCALE)}
            onPhoneCountryChange={(event) => {
              editor.update(
                setPhoneNumber(
                  document,
                  event.target.value === '' ? null : event.target.value,
                  document.contact.phone.nationalNumber ?? '',
                ),
              );
            }}
            onEmailVisibilityChange={(event) => {
              editor.update(setContactVisibility(document, 'email', event.target.checked));
            }}
            onPhoneVisibilityChange={(event) => {
              editor.update(setContactVisibility(document, 'phone', event.target.checked));
            }}
          />

          <SectionList title={t('sections.title')} hint={t('sections.hint')} sections={sections} />

          <SeoFields
            labels={props.labels}
            title={document.seo.title ?? ''}
            description={document.seo.description ?? ''}
            isIndexable={document.seo.indexable}
            onTitleChange={(event) => {
              editor.update(setSeoField(document, 'title', event.target.value));
            }}
            onDescriptionChange={(event) => {
              editor.update(setSeoField(document, 'description', event.target.value));
            }}
            onIndexableChange={(event) => {
              editor.update(setIndexable(document, event.target.checked));
            }}
          />
        </>
      }
      preview={
        home === null ? null : (
          <PortfolioTemplate
            document={document}
            sections={home.sections}
            navigation={buildNavigation(document, props.portfolioId, HOME_PAGE_SLUG)}
            labels={buildPortfolioLabels(tPortfolio)}
            portfolioSlug={props.portfolioId}
            pageTitle={home.page.title}
            isPreview
            actions={null}
            footerLinks={null}
          />
        )
      }
    />
  );
}
