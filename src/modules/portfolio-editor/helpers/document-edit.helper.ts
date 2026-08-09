import type { PortfolioDocument } from '@/modules/portfolio-document';

import type {
  AnyCollectionItem,
  CollectionItem,
  CreatePageInput,
  IdentifiedCollectionKey,
} from '../types/collection-edit.types';
import type {
  AttachmentAssetEditInput,
  GalleryAssetEditInput,
} from '../types/document-asset-edit.types';

import {
  formatCollectionEntry,
  isRequiredCollectionField,
  isStringArray,
} from './collection-field.helper';

export function appendCollectionItem<TKey extends IdentifiedCollectionKey>(
  document: PortfolioDocument,
  key: TKey,
  item: CollectionItem<TKey>,
): PortfolioDocument {
  return { ...document, [key]: [...document[key], item] };
}

export function updateCollectionItem<TKey extends IdentifiedCollectionKey>(
  document: PortfolioDocument,
  key: TKey,
  itemId: string,
  patch: Partial<CollectionItem<TKey>>,
): PortfolioDocument {
  return {
    ...document,
    [key]: document[key].map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
  };
}

export function removeCollectionItem(
  document: PortfolioDocument,
  key: IdentifiedCollectionKey,
  itemId: string,
): PortfolioDocument {
  return { ...document, [key]: document[key].filter((item) => item.id !== itemId) };
}

export function moveCollectionItem(
  document: PortfolioDocument,
  key: IdentifiedCollectionKey,
  from: number,
  to: number,
): PortfolioDocument {
  return { ...document, [key]: moveItem<AnyCollectionItem>(document[key], from, to) };
}

export function setInterests(
  document: PortfolioDocument,
  interests: readonly string[],
): PortfolioDocument {
  return { ...document, interests: interests.map((item) => item.trim()).filter(Boolean) };
}

export function appendEmptyCollectionItem(
  document: PortfolioDocument,
  key: IdentifiedCollectionKey,
  id: string,
): PortfolioDocument {
  switch (key) {
    case 'experience': {
      return appendCollectionItem(document, key, {
        id,
        organization: '',
        title: '',
        location: null,
        startDate: null,
        endDate: null,
        current: false,
        summary: null,
        highlights: [],
        technologies: [],
      });
    }
    case 'projects': {
      return appendCollectionItem(document, key, {
        id,
        slug: null,
        name: '',
        role: null,
        year: null,
        coverAssetId: null,
        featured: false,
        summary: null,
        highlights: [],
        technologies: [],
        links: [],
        content: [],
      });
    }
    case 'skills': {
      return appendCollectionItem(document, key, { id, label: '', tier: 'working', items: [] });
    }
    case 'softSkills': {
      return appendCollectionItem(document, key, { id, label: '', detail: null });
    }
    case 'education': {
      return appendCollectionItem(document, key, {
        id,
        institution: '',
        degree: null,
        field: null,
        startDate: null,
        endDate: null,
        location: null,
        details: null,
      });
    }
    case 'courses': {
      return appendCollectionItem(document, key, {
        id,
        name: '',
        provider: null,
        date: null,
        url: null,
        summary: null,
      });
    }
    case 'certifications': {
      return appendCollectionItem(document, key, {
        id,
        name: '',
        issuer: null,
        date: null,
        credentialUrl: null,
      });
    }
    case 'languages': {
      return appendCollectionItem(document, key, { id, name: '', proficiency: null });
    }
    case 'awards': {
      return appendCollectionItem(document, key, {
        id,
        name: '',
        issuer: null,
        date: null,
        description: null,
      });
    }
    case 'publications': {
      return appendCollectionItem(document, key, {
        id,
        title: '',
        publisher: null,
        date: null,
        url: null,
        summary: null,
      });
    }
    case 'volunteering': {
      return appendCollectionItem(document, key, {
        id,
        organization: '',
        role: null,
        startDate: null,
        endDate: null,
        summary: null,
      });
    }
    case 'testimonials': {
      return appendCollectionItem(document, key, {
        id,
        quote: '',
        author: '',
        role: null,
        organization: null,
      });
    }
    case 'socialLinks': {
      return appendCollectionItem(document, key, {
        id,
        kind: 'website',
        label: null,
        url: 'https://',
        visible: true,
      });
    }
  }
}

export function setCollectionPrimaryField(
  document: PortfolioDocument,
  key: IdentifiedCollectionKey,
  itemId: string,
  value: string,
): PortfolioDocument {
  switch (key) {
    case 'experience': {
      return updateCollectionItem(document, key, itemId, { organization: value });
    }
    case 'projects': {
      return updateCollectionItem(document, key, itemId, { name: value });
    }
    case 'skills':
    case 'softSkills': {
      return updateCollectionItem(document, key, itemId, { label: value });
    }
    case 'education': {
      return updateCollectionItem(document, key, itemId, { institution: value });
    }
    case 'courses':
    case 'certifications':
    case 'languages':
    case 'awards': {
      return updateCollectionItem(document, key, itemId, { name: value });
    }
    case 'publications': {
      return updateCollectionItem(document, key, itemId, { title: value });
    }
    case 'volunteering': {
      return updateCollectionItem(document, key, itemId, { organization: value });
    }
    case 'testimonials': {
      return updateCollectionItem(document, key, itemId, { quote: value });
    }
    case 'socialLinks': {
      return updateCollectionItem(document, key, itemId, { url: value });
    }
  }
}

export function collectionBooleanFieldValue(item: AnyCollectionItem, field: string): boolean {
  const fields: Record<string, unknown> = { ...item };
  const value = fields[field];

  return typeof value === 'boolean' && value;
}

export function collectionTextFieldValue(item: AnyCollectionItem, field: string): string {
  const fields: Record<string, unknown> = { ...item };
  const value = fields[field];
  if (Array.isArray(value)) {
    return value
      .map((entry) => formatCollectionEntry(entry))
      .filter(Boolean)
      .join('\n');
  }
  return typeof value === 'string' ? value : '';
}

export function setCollectionField(
  document: PortfolioDocument,
  key: IdentifiedCollectionKey,
  itemId: string,
  field: string,
  value: string | boolean | readonly string[] | null,
): PortfolioDocument {
  if (key === 'projects' && field === 'content' && isStringArray(value)) {
    return {
      ...document,
      projects: document.projects.map((item) =>
        item.id === itemId
          ? {
              ...item,
              content: value.map((text, index) => ({
                id: `${item.id}-paragraph-${index}`,
                kind: 'paragraph' as const,
                text,
              })),
            }
          : item,
      ),
    };
  }
  if (key === 'projects' && field === 'links' && isStringArray(value)) {
    return {
      ...document,
      projects: document.projects.map((item) =>
        item.id === itemId
          ? {
              ...item,
              links: value.flatMap((line, index) => {
                const separator = line.indexOf('|');
                if (separator < 1) return [];
                const label = line.slice(0, separator).trim();
                const url = line.slice(separator + 1).trim();
                return label === '' || url === ''
                  ? []
                  : [
                      {
                        id: `${item.id}-link-${index}`,
                        kind: 'project',
                        label,
                        url,
                        visible: true,
                      },
                    ];
              }),
            }
          : item,
      ),
    };
  }
  const normalized =
    typeof value === 'string' && value.trim() === '' && !isRequiredCollectionField(key, field)
      ? null
      : value;
  return {
    ...document,
    [key]: document[key].map((item) =>
      item.id === itemId ? { ...item, [field]: normalized } : item,
    ),
  };
}

export function createPage(document: PortfolioDocument, input: CreatePageInput): PortfolioDocument {
  return {
    ...document,
    pages: [
      ...document.pages,
      {
        ...input,
        description: null,
        visible: true,
        visibility: 'public',
        passwordHash: null,
        order: document.pages.length * 10,
        sections: [],
      },
    ],
  };
}

export function editPage(
  document: PortfolioDocument,
  pageId: string,
  patch: Partial<
    Pick<
      PortfolioDocument['pages'][number],
      'slug' | 'title' | 'navLabel' | 'description' | 'visible' | 'visibility'
    >
  >,
): PortfolioDocument {
  return {
    ...document,
    pages: document.pages.map((page) => (page.id === pageId ? { ...page, ...patch } : page)),
  };
}

export function movePage(document: PortfolioDocument, from: number, to: number): PortfolioDocument {
  const pages = moveItem(document.pages, from, to);
  return { ...document, pages: pages.map((page, index) => ({ ...page, order: index * 10 })) };
}

export function removePage(document: PortfolioDocument, pageId: string): PortfolioDocument {
  const page = document.pages.find((candidate) => candidate.id === pageId);
  if (page?.slug === '') return document;
  return { ...document, pages: document.pages.filter((candidate) => candidate.id !== pageId) };
}

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

export function setPortraitAsset(
  document: PortfolioDocument,
  assetId: string | null,
): PortfolioDocument {
  return {
    ...document,
    identity: { ...document.identity, portraitAssetId: assetId },
  };
}

export function setAvailabilityEnabled(
  document: PortfolioDocument,
  availabilityEnabled: boolean,
): PortfolioDocument {
  return {
    ...document,
    identity: { ...document.identity, availabilityEnabled },
  };
}

export function appendGalleryAsset(
  document: PortfolioDocument,
  input: GalleryAssetEditInput,
): PortfolioDocument {
  const alt = input.alt.trim();
  if (alt === '' || document.gallery.some((item) => item.assetId === input.assetId)) {
    return document;
  }

  return {
    ...document,
    gallery: [
      ...document.gallery,
      {
        id: `gallery-${input.assetId}`,
        assetId: input.assetId,
        alt,
        caption: input.caption.trim() === '' ? null : input.caption,
      },
    ],
  };
}

export function appendAttachmentAsset(
  document: PortfolioDocument,
  input: AttachmentAssetEditInput,
): PortfolioDocument {
  const label = input.label.trim();
  if (label === '' || document.attachments.some((item) => item.assetId === input.assetId)) {
    return document;
  }

  return {
    ...document,
    attachments: [
      ...document.attachments,
      {
        id: `attachment-${input.assetId}`,
        ...input,
        label,
        visible: true,
      },
    ],
  };
}

export function setEmailValue(document: PortfolioDocument, value: string): PortfolioDocument {
  const trimmed = value.trim();

  return {
    ...document,
    contact: {
      ...document.contact,
      email: { ...document.contact.email, value: trimmed === '' ? null : trimmed },
    },
  };
}

/**
 * The number and the country are set together because they are one answer.
 *
 * Storing a national number without the country it belongs to produces
 * `100-156-8256`, which is unusable to anyone outside that country — and the
 * reader has no way to tell which country it was.
 */
export function setPhoneNumber(
  document: PortfolioDocument,
  countryIso: string | null,
  nationalNumber: string,
): PortfolioDocument {
  const trimmed = nationalNumber.trim();

  return {
    ...document,
    contact: {
      ...document.contact,
      phone: {
        ...document.contact.phone,
        countryIso: countryIso === '' ? null : countryIso,
        nationalNumber: trimmed === '' ? null : trimmed,
      },
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
