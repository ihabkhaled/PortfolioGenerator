/**
 * Editor UI surface.
 *
 * Separate from `index.ts` (pure helpers and types) so the route can mount the
 * editor without the barrel dragging the publishing services — and their
 * database client — into the client bundle.
 */

export { ContactFields } from './components/contact-fields.component';
export { EditorShell } from './components/editor-shell.component';
export { IdentityFields } from './components/identity-fields.component';
export { SectionList } from './components/section-list.component';
export { SeoFields } from './components/seo-fields.component';
export { WarningList } from './components/warning-list.component';
export { editorClasses } from './constants/editor-style.constants';
export { AssetCollectionsUploadContainer } from './containers/asset-collections-upload.container';
export { CollectionEntryContainer } from './containers/collection-entry.container';
export { CollectionManagerContainer } from './containers/collection-manager.container';
export { PageManagerContainer } from './containers/page-manager.container';
export { PortfolioEditorContainer } from './containers/portfolio-editor.container';
export { PortraitUploadContainer } from './containers/portrait-upload.container';
export { PublishPanelContainer } from './containers/publish-panel.container';
export { DraftStatusProvider } from './contexts/draft-status.context';
export { useDraftEditor } from './hooks/use-draft-editor.hook';
export type {
  ContactFieldsProps,
  IdentityFieldsProps,
  SeoFieldsProps,
} from './types/editor-field.types';
export type {
  EditorContainerProps,
  EditorLabels,
  EditorShellProps,
  WarningListProps,
} from './types/editor-view.types';
export type { SectionListEntry, SectionListProps } from './types/section-list.types';
export type { PublishPanelProps } from './types/publish-panel.types';
export type { PortraitUploadProps } from './types/portrait-upload.types';
