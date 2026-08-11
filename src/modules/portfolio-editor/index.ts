/** Public surface of the portfolio-editor module (pure helpers and types). */

export { EDITOR_ERROR_KEYS, EDITOR_INITIAL_STATE } from './constants/editor.constants';
export { resolveEditorIssueTarget } from './helpers/editor-issue-target.helper';
export { zoomAroundViewportCenter } from './helpers/image-crop-geometry.helper';
export {
  appendCollectionItem,
  appendEmptyCollectionItem,
  collectionBooleanFieldValue,
  collectionTextFieldValue,
  createPage,
  editPage,
  moveCollectionItem,
  movePage,
  removeCollectionItem,
  removePage,
  setInterests,
  setCollectionPrimaryField,
  setCollectionField,
  updateCollectionItem,
  appendAttachmentAsset,
  appendGalleryAsset,
  moveItem,
  moveSection,
  removeItem,
  setContactVisibility,
  setAvailabilityEnabled,
  setEmailValue,
  setPhoneNumber,
  setPortraitAsset,
  setIdentityField,
  setIndexable,
  setSectionVisibility,
  setAssetSectionPlacement,
  setSeoField,
} from './helpers/document-edit.helper';
export { claimSlugSchema, portfolioIdSchema, saveDraftSchema } from './schemas/editor.schema';
export {
  formatCollectionEntry,
  isRequiredCollectionField,
  isStringArray,
  isStringRecord,
} from './helpers/collection-field.helper';
export type { DraftEditor, DraftEditorInput } from './types/draft-editor.types';
export type {
  EditorActionState,
  EditorIssue,
  EditorIssueTarget,
  SaveDraftPayload,
} from './types/editor.types';
export type { CreatePageInput, IdentifiedCollectionKey } from './types/collection-edit.types';
