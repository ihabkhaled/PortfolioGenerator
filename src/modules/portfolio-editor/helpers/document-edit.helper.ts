import type { PortfolioDocument } from '@/modules/portfolio-document';

/**
 * Immutable edits to a document.
 *
 * Pure functions rather than a form library's mutable model, for two reasons:
 * the result has to survive `portfolioDocumentSchema` on the server anyway, and
 * the reorder operations below are the accessible alternative to drag-and-drop
 * — they need to be callable from a keyboard-driven button, not just a pointer
 * gesture.
 */

/**
 * Set an identity field.
 *
 * An emptied optional field becomes null rather than an empty string: the
 * renderer's "is this present" checks are null checks, and an empty string
 * would render an empty element with a heading above it.
 *
 * `displayName` is the exception — it is required, so an empty value stays a
 * string and fails validation with a message rather than silently becoming
 * absent.
 */
export function setIdentityField(
  document: PortfolioDocument,
  field: keyof PortfolioDocument['identity'],
  value: string,
): PortfolioDocument {
  const isRequired = field === 'displayName';
  const isBlank = value.trim() === '';

  return {
    ...document,
    identity: {
      ...document.identity,
      [field]: isRequired || !isBlank ? value : null,
    },
  };
}

export function setContactValue(
  document: PortfolioDocument,
  channel: 'email' | 'phone',
  value: string,
): PortfolioDocument {
  const trimmed = value.trim();

  return {
    ...document,
    contact: {
      ...document.contact,
      [channel]: { ...document.contact[channel], value: trimmed === '' ? null : trimmed },
    },
  };
}

export function setContactVisibility(
  document: PortfolioDocument,
  channel: 'email' | 'phone',
  visible: boolean,
): PortfolioDocument {
  return {
    ...document,
    contact: {
      ...document.contact,
      [channel]: { ...document.contact[channel], visible },
    },
  };
}

export function setSeoField(
  document: PortfolioDocument,
  field: 'title' | 'description',
  value: string,
): PortfolioDocument {
  const trimmed = value.trim();

  return { ...document, seo: { ...document.seo, [field]: trimmed === '' ? null : value } };
}

export function setIndexable(document: PortfolioDocument, indexable: boolean): PortfolioDocument {
  return { ...document, seo: { ...document.seo, indexable } };
}

/**
 * Move an item within a list.
 *
 * Index-based and bounds-checked, so the same function backs both the drag
 * handle and the move-up/move-down buttons. Out-of-range moves return the list
 * unchanged rather than throwing: a keyboard user pressing "up" on the first
 * item should get nothing, not an error boundary.
 */
export function moveItem<TItem>(
  items: readonly TItem[],
  from: number,
  to: number,
): readonly TItem[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(from, 1);

  /* v8 ignore next 3 -- the bounds check above makes the splice always yield an item. */
  if (moved === undefined) {
    return items;
  }

  next.splice(to, 0, moved);

  return next;
}

export function removeItem<TItem>(items: readonly TItem[], index: number): readonly TItem[] {
  if (index < 0 || index >= items.length) {
    return items;
  }

  return items.filter((_item, position) => position !== index);
}

/**
 * Reorder the sections of a page, renumbering `order` to match.
 *
 * The array position is what the user manipulated; `order` is what the renderer
 * sorts by. Leaving them to disagree is how a reorder appears to work in the
 * editor and does nothing on the published page.
 */
export function moveSection(
  document: PortfolioDocument,
  pageId: string,
  from: number,
  to: number,
): PortfolioDocument {
  return {
    ...document,
    pages: document.pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            sections: moveItem(page.sections, from, to).map((section, index) => ({
              ...section,
              order: index * 10,
            })),
          }
        : page,
    ),
  };
}

export function setSectionVisibility(
  document: PortfolioDocument,
  pageId: string,
  sectionId: string,
  visible: boolean,
): PortfolioDocument {
  return {
    ...document,
    pages: document.pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            sections: page.sections.map((section) =>
              section.id === sectionId ? { ...section, visible } : section,
            ),
          }
        : page,
    ),
  };
}
