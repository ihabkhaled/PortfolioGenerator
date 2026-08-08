/**
 * Editor UI surface.
 *
 * Separate from `index.ts` (pure helpers and types) so the route can mount the
 * editor without the barrel dragging the publishing services — and their
 * database client — into the client bundle.
 */

export { editorClasses } from './constants/editor-style.constants';
export { PortfolioEditorContainer } from './containers/portfolio-editor.container';
export { PublishPanelContainer } from './containers/publish-panel.container';
export type { EditorContainerProps, EditorLabels } from './types/editor-view.types';
export type { PublishPanelProps } from './types/publish-panel.types';
