/** Public surface of the portfolio-editor module (pure helpers and types). */

export { EDITOR_ERROR_KEYS, EDITOR_INITIAL_STATE } from './constants/editor.constants';
export {
  moveItem,
  moveSection,
  removeItem,
  setContactVisibility,
  setEmailValue,
  setPhoneNumber,
  setIdentityField,
  setIndexable,
  setSectionVisibility,
  setSeoField,
} from './helpers/document-edit.helper';
export { claimSlugSchema, portfolioIdSchema, saveDraftSchema } from './schemas/editor.schema';
export type { DraftEditor, DraftEditorInput } from './types/draft-editor.types';
export type { EditorActionState, SaveDraftPayload } from './types/editor.types';
