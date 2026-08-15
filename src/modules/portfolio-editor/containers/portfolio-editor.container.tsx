'use client';
// client-boundary-reason: the editor holds an in-progress draft, a dirty flag
// and a save lifecycle, and re-renders the live preview on every keystroke.

import { useState, type ReactElement } from 'react';

import { buildNavigation, findVisiblePage, HOME_PAGE_SLUG } from '@/modules/portfolio-document';
import { buildPortfolioLabels, PortfolioTemplate } from '@/modules/portfolio-renderer';
import { APP_LOCALE, I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { ErrorIcon } from '@/packages/icons';
import { Button } from '@/packages/ui-primitives';
import { buildDashboardAssetPath } from '@/shared/constants/route-paths.constants';
import { sortCountriesByName } from '@/shared/utils/phone-number.util';

import { ContactFields } from '../components/contact-fields.component';
import { EditorDisclosure } from '../components/editor-disclosure.component';
import { EditorShell } from '../components/editor-shell.component';
import { IdentityFields } from '../components/identity-fields.component';
import { SectionList } from '../components/section-list.component';
import { SeoFields } from '../components/seo-fields.component';
import { WarningList } from '../components/warning-list.component';
import { editorClasses } from '../constants/editor-style.constants';
import { EDITOR_COLLECTION_KEYS, EDITOR_ERROR_KEYS } from '../constants/editor.constants';
import { useDraftStatusPublisher } from '../contexts/draft-status.context';
import {
  appendAttachmentAsset,
  appendGalleryAsset,
  moveSection,
  removeItem,
  setContactVisibility,
  setAvailabilityEnabled,
  setEmailValue,
  setPhoneNumber,
  setPortraitAsset,
  setAssetSectionPlacement,
  setIdentityField,
  setIndexable,
  setSectionVisibility,
  setSeoField,
} from '../helpers/document-edit.helper';
import { resolveEditorIssueTarget } from '../helpers/editor-issue-target.helper';
import { getImportedCompanies, getImportedPageOrder } from '../helpers/imported-content.helper';
import { useDraftEditor } from '../hooks/use-draft-editor.hook';
import type { EditorContainerProps, EditorMobilePane } from '../types/editor-view.types';
import type { SectionListEntry } from '../types/section-list.types';

import { AssetCollectionsUploadContainer } from './asset-collections-upload.container';
import { CollectionManagerContainer } from './collection-manager.container';
import { EditorIssueNavigatorContainer } from './editor-issue-navigator.container';
import { PageManagerContainer } from './page-manager.container';
import { PortraitUploadContainer } from './portrait-upload.container';

export function PortfolioEditorContainer(props: Readonly<EditorContainerProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.editor);
  const tPortfolio = useAppTranslation(I18N_NAMESPACES.portfolio);
  // "Edit" / "Preview" are the same two words the dashboard's own portfolio
  // actions already use, and are already fully localized there — reusing them
  // keeps this segmented control legible in every locale that already
  // exists, instead of adding two more keys the rest of the catalog would
  // need to catch up to.
  const tDashboard = useAppTranslation(I18N_NAMESPACES.dashboard);
  const editor = useDraftEditor({
    portfolioId: props.portfolioId,
    initialDocument: props.initialDocument,
    initialVersion: props.initialVersion,
  });
  const [mobilePane, setMobilePane] = useState<EditorMobilePane>('forms');

  useDraftStatusPublisher({
    isDirty: editor.isDirty,
    isSaving: editor.isSaving,
    save: editor.save,
  });

  const { document } = editor;
  const home = findVisiblePage(document, HOME_PAGE_SLUG);
  const homePage = document.pages.find((page) => page.slug === HOME_PAGE_SLUG);
  const importedCompanies = getImportedCompanies(document);
  const importedPageOrder = getImportedPageOrder(document);

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
  const issueTargets = editor.issues
    .map((issue) => resolveEditorIssueTarget(document, issue))
    .filter((target) => target !== null);
  const generalIssues = editor.issues.filter(
    (issue) => resolveEditorIssueTarget(document, issue) === null,
  );

  return (
    <EditorShell
      title={document.identity.displayName || t('untitled')}
      subtitle={t(editor.isDirty ? 'unsaved' : 'saved')}
      showingPreview={mobilePane === 'preview'}
      onEditClick={() => {
        setMobilePane('forms');
      }}
      onPreviewClick={() => {
        setMobilePane('preview');
      }}
      mobileEditLabel={tDashboard('actions.edit')}
      mobilePreviewLabel={tDashboard('actions.preview')}
      actions={
        <div className={editorClasses.actionDock} data-fixed-surface="editor-actions">
          <span className={editor.isDirty ? editorClasses.status : editorClasses.statusSaved}>
            {t(editor.isDirty ? 'unsaved' : 'saved')}
          </span>
          {editor.issues.length === 0 ? null : (
            <EditorIssueNavigatorContainer
              targets={issueTargets}
              countLabel={t('issues.count', { count: editor.issues.length })}
              previousLabel={t('issues.previous')}
              nextLabel={t('issues.next')}
              message={t('issues.fieldMessage')}
              generalIssues={generalIssues}
              generalTitle={t('issues.general')}
              onNavigate={() => {
                setMobilePane('forms');
              }}
            />
          )}
          <Button onClick={editor.save} disabled={!editor.isDirty || editor.isSaving}>
            {t(editor.isSaving ? 'saving' : 'save')}
          </Button>
        </div>
      }
      forms={
        <>
          {editor.error === null || editor.error === EDITOR_ERROR_KEYS.invalidDocument ? null : (
            <p className={editorClasses.error} role="alert">
              <ErrorIcon aria-hidden size={18} />
              <span className={editorClasses.errorText}>{t(editor.error)}</span>
            </p>
          )}

          <WarningList title={t('warningsTitle')} warnings={props.warnings} />

          <EditorDisclosure
            id="editor-identity"
            title={t('disclosures.identity')}
            summary={t('disclosures.items', { count: 8 })}
            defaultOpen
          >
            <IdentityFields
              labels={props.labels}
              displayName={document.identity.displayName}
              headline={document.identity.headline ?? ''}
              summary={document.identity.summary ?? ''}
              location={document.identity.location ?? ''}
              nationality={document.identity.nationality ?? ''}
              militaryStatus={document.identity.militaryStatus ?? ''}
              tagline={document.identity.tagline ?? ''}
              availabilityEnabled={document.identity.availabilityEnabled}
              availabilityNote={document.identity.availabilityNote ?? ''}
              coverLetter={document.identity.coverLetter ?? ''}
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
              onNationalityChange={(event) => {
                editor.update(setIdentityField(document, 'nationality', event.target.value));
              }}
              onMilitaryStatusChange={(event) => {
                editor.update(setIdentityField(document, 'militaryStatus', event.target.value));
              }}
              onTaglineChange={(event) => {
                editor.update(setIdentityField(document, 'tagline', event.target.value));
              }}
              onAvailabilityEnabledChange={(event) => {
                editor.update(setAvailabilityEnabled(document, event.target.checked));
              }}
              onAvailabilityNoteChange={(event) => {
                editor.update(setIdentityField(document, 'availabilityNote', event.target.value));
              }}
              onCoverLetterChange={(event) => {
                editor.update(setIdentityField(document, 'coverLetter', event.target.value));
              }}
            />
          </EditorDisclosure>

          <EditorDisclosure
            id="editor-assets"
            title={t('disclosures.assets')}
            summary={t('disclosures.items', {
              count: document.gallery.length + document.attachments.length,
            })}
          >
            <PortraitUploadContainer
              portfolioId={props.portfolioId}
              hasPortrait={document.identity.portraitAssetId !== null}
              uploadAction={props.uploadAssetAction}
              onUploaded={(assetId) => {
                editor.update(setPortraitAsset(document, assetId));
              }}
              onRemove={() => {
                editor.update(setPortraitAsset(document, null));
              }}
            />

            <AssetCollectionsUploadContainer
              portfolioId={props.portfolioId}
              gallery={document.gallery}
              attachments={document.attachments}
              pages={document.pages}
              uploadAction={props.uploadAssetAction}
              onGalleryUploaded={(asset, alt, caption) => {
                editor.update(appendGalleryAsset(document, { assetId: asset.id, alt, caption }));
              }}
              onAttachmentUploaded={(asset, kind, label) => {
                editor.update(
                  appendAttachmentAsset(document, {
                    assetId: asset.id,
                    kind,
                    label,
                    fileName: asset.originalFilename,
                    contentType: asset.contentType,
                    sizeBytes: asset.sizeBytes,
                  }),
                );
              }}
              onGalleryRemove={(index) => {
                editor.update({ ...document, gallery: [...removeItem(document.gallery, index)] });
              }}
              onAttachmentRemove={(index) => {
                editor.update({
                  ...document,
                  attachments: [...removeItem(document.attachments, index)],
                });
              }}
              onAttachmentVisibilityChange={(index, visible) => {
                editor.update({
                  ...document,
                  attachments: document.attachments.map((attachment, attachmentIndex) =>
                    attachmentIndex === index ? { ...attachment, visible } : attachment,
                  ),
                });
              }}
              onPlacementChange={(type, pageId, placed) => {
                editor.update(setAssetSectionPlacement(document, pageId, type, placed));
              }}
            />
          </EditorDisclosure>

          <EditorDisclosure
            id="editor-collections"
            title={t('disclosures.collections')}
            summary={t('disclosures.items', {
              count:
                EDITOR_COLLECTION_KEYS.reduce((count, key) => count + document[key].length, 0) +
                importedCompanies.length,
            })}
          >
            <CollectionManagerContainer document={document} onChange={editor.update} />
          </EditorDisclosure>

          <EditorDisclosure
            id="editor-contact"
            title={t('disclosures.contact')}
            summary={t('disclosures.items', {
              count:
                Number(document.contact.email.value !== null) +
                Number(document.contact.phone.nationalNumber !== null),
            })}
          >
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
          </EditorDisclosure>

          <EditorDisclosure
            id="editor-sections"
            title={t('disclosures.sections')}
            summary={t('disclosures.items', { count: sections.length })}
          >
            <SectionList
              title={t('sections.title')}
              hint={t('sections.hint')}
              sections={sections}
            />
          </EditorDisclosure>

          <EditorDisclosure
            id="editor-pages"
            title={t('disclosures.pages')}
            summary={t('disclosures.items', {
              count: document.pages.length,
            })}
          >
            <PageManagerContainer
              portfolioId={props.portfolioId}
              expectedVersion={editor.version}
              document={document}
              importedPageOrder={importedPageOrder}
              onChange={editor.update}
              onVersionChange={editor.adoptVersion}
            />
          </EditorDisclosure>

          <EditorDisclosure
            id="editor-seo"
            title={t('disclosures.seo')}
            summary={t('disclosures.items', { count: 3 })}
          >
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
          </EditorDisclosure>
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
            buildAssetPath={(assetId) => buildDashboardAssetPath(props.portfolioId, assetId)}
          />
        )
      }
    />
  );
}
