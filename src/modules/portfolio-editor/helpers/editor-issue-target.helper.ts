import type { PortfolioDocument } from '@/modules/portfolio-document';

import {
  EDITOR_COLLECTION_KEYS,
  EDITOR_ISSUE_DIRECT_CONTROLS,
} from '../constants/editor.constants';
import type { IdentifiedCollectionKey } from '../types/collection-edit.types';
import type { EditorIssue, EditorIssueTarget } from '../types/editor.types';

export function resolvePageTarget(
  document: PortfolioDocument,
  issue: EditorIssue,
): EditorIssueTarget | null {
  const [, position, field] = issue.path;
  if (typeof position !== 'number') return null;
  const page = document.pages[position];
  if (page === undefined) return null;
  if (field === 'sections') {
    return { controlId: 'editor-sections-list', disclosureIds: ['editor-sections'] };
  }
  const suffix = field === 'navLabel' ? 'nav' : field;
  if (typeof suffix !== 'string' || !['title', 'nav', 'slug', 'description'].includes(suffix)) {
    return null;
  }
  return {
    controlId: `${page.id}-${suffix}`,
    disclosureIds: ['editor-pages', `editor-page-${page.id}`],
  };
}

export function resolveCollectionTarget(
  document: PortfolioDocument,
  issue: EditorIssue,
): EditorIssueTarget | null {
  const [root, position, field] = issue.path;
  if (typeof root !== 'string' || typeof position !== 'number' || typeof field !== 'string') {
    return null;
  }
  if (!EDITOR_COLLECTION_KEYS.includes(root as IdentifiedCollectionKey)) return null;
  const collection = document[root as keyof PortfolioDocument];
  if (!Array.isArray(collection)) return null;
  const item = collection[position] as { readonly id?: unknown } | undefined;
  if (typeof item?.id !== 'string') return null;
  return {
    controlId: `${root}-${item.id}-${field}`,
    disclosureIds: ['editor-collections', `editor-collection-${root}`, `editor-${root}-${item.id}`],
  };
}

export function resolveEditorIssueTarget(
  document: PortfolioDocument,
  issue: EditorIssue,
): EditorIssueTarget | null {
  const [root, position, field] = issue.path;
  if (root === 'pages') return resolvePageTarget(document, issue);
  if (root === 'gallery' || root === 'attachments') return null;
  if (typeof position === 'number' && typeof field === 'string') {
    return resolveCollectionTarget(document, issue);
  }
  const controlId = EDITOR_ISSUE_DIRECT_CONTROLS[issue.path.join('.')];
  if (controlId === undefined) return null;
  const disclosure = typeof root === 'string' ? `editor-${root}` : null;
  return { controlId, disclosureIds: disclosure === null ? [] : [disclosure] };
}
