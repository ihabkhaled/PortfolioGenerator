import { describe, expect, it } from 'vitest';

import { portfolioDocumentSchema } from '@/modules/portfolio-document';
import {
  appendCollectionItem,
  appendEmptyCollectionItem,
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
  setEmailValue,
  setPhoneNumber,
  setPortraitAsset,
  setIdentityField,
  setIndexable,
  setSectionVisibility,
  setAssetSectionPlacement,
  setSeoField,
} from '@/modules/portfolio-editor';
import { parseSchema } from '@/packages/zod';

import { buildFullPortfolioDocument, pageBySlug } from '../fixtures/portfolio-document.fixtures';

describe('setIdentityField', () => {
  it('keeps an emptied optional field as null so the renderer skips it', () => {
    const next = setIdentityField(buildFullPortfolioDocument(), 'location', ' '.repeat(3));

    expect(next.identity.location).toBeNull();
  });

  it('keeps an emptied display name as a string so validation can complain', () => {
    const next = setIdentityField(buildFullPortfolioDocument(), 'displayName', '');

    expect(next.identity.displayName).toBe('');
  });

  it('preserves leading and trailing spaces the user typed inside a value', () => {
    const next = setIdentityField(buildFullPortfolioDocument(), 'headline', ' Staff engineer ');

    expect(next.identity.headline).toBe(' Staff engineer ');
  });

  it('does not mutate the input document', () => {
    const document = buildFullPortfolioDocument();

    setIdentityField(document, 'location', 'Cairo');

    expect(document.identity.location).toBe('Lisbon, Portugal');
  });
});

describe('setPortraitAsset', () => {
  it('stores a clean uploaded portrait reference without changing other identity fields', () => {
    const document = buildFullPortfolioDocument();
    const next = setPortraitAsset(document, 'asset-portrait');

    expect(next.identity.portraitAssetId).toBe('asset-portrait');
    expect(next.identity.displayName).toBe(document.identity.displayName);
    expect(document.identity.portraitAssetId).toBeNull();
  });

  it('removes the portrait when passed null', () => {
    const withPortrait = setPortraitAsset(buildFullPortfolioDocument(), 'asset-portrait');

    expect(setPortraitAsset(withPortrait, null).identity.portraitAssetId).toBeNull();
  });
});

describe('contact edits', () => {
  it('nulls an emptied email address', () => {
    const next = setEmailValue(buildFullPortfolioDocument(), '  ');

    expect(next.contact.email.value).toBeNull();
  });

  it('stores a trimmed address', () => {
    const next = setEmailValue(buildFullPortfolioDocument(), '  noor@example.com  ');

    expect(next.contact.email.value).toBe('noor@example.com');
  });

  // Visibility is a separate decision from the value: clearing the address
  // should not silently re-expose it when the user types a new one.
  it('leaves visibility alone when the value changes', () => {
    const next = setPhoneNumber(buildFullPortfolioDocument(), 'EG', '100 000 0000');

    expect(next.contact.phone).toEqual({
      countryIso: 'EG',
      nationalNumber: '100 000 0000',
      visible: false,
    });
  });

  // A national number without its country renders as `100-156-8256`, which is
  // unusable to anyone outside that country.
  it('keeps the country when only the number changes', () => {
    const withCountry = setPhoneNumber(buildFullPortfolioDocument(), 'PT', '000 000 000');
    const next = setPhoneNumber(withCountry, withCountry.contact.phone.countryIso, '111 111 111');

    expect(next.contact.phone.countryIso).toBe('PT');
    expect(next.contact.phone.nationalNumber).toBe('111 111 111');
  });

  it('treats an emptied country as no country rather than an empty string', () => {
    const next = setPhoneNumber(buildFullPortfolioDocument(), '', '100 000 0000');

    expect(next.contact.phone.countryIso).toBeNull();
  });

  it('nulls an emptied number', () => {
    const next = setPhoneNumber(buildFullPortfolioDocument(), 'EG', ' '.repeat(3));

    expect(next.contact.phone.nationalNumber).toBeNull();
  });

  it('toggles visibility without touching the value', () => {
    const next = setContactVisibility(buildFullPortfolioDocument(), 'phone', true);

    expect(next.contact.phone.visible).toBe(true);
    expect(next.contact.phone.nationalNumber).toBe('000 000 000');
  });
});

describe('seo edits', () => {
  it('nulls an emptied override so the fallback title is used', () => {
    const next = setSeoField(buildFullPortfolioDocument(), 'title', ' '.repeat(3));

    expect(next.seo.title).toBeNull();
  });

  it('records an explicit noindex choice', () => {
    const next = setIndexable(buildFullPortfolioDocument(), false);

    expect(next.seo.indexable).toBe(false);
  });
});

describe('moveItem', () => {
  it('moves an item forward', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  });

  it('moves an item backward', () => {
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  // Pressing "move up" on the first row is a no-op, not an error boundary.
  it.each([
    ['out of range source', -1, 0],
    ['out of range target', 0, 9],
    ['same position', 1, 1],
  ])('returns the list unchanged for %s', (_label, from, to) => {
    const items = ['a', 'b', 'c'];

    expect(moveItem(items, from, to)).toEqual(items);
  });
});

describe('removeItem', () => {
  it('removes by position', () => {
    expect(removeItem(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
  });

  it('ignores an out-of-range index', () => {
    expect(removeItem(['a', 'b'], 5)).toEqual(['a', 'b']);
  });
});

describe('moveSection', () => {
  it('renumbers order so the published page matches the editor', () => {
    const next = moveSection(buildFullPortfolioDocument(), 'page-home', 0, 2);
    const home = pageBySlug(next, '');

    expect(home.sections.map((section) => section.type)).toEqual([
      'about',
      'experience',
      'hero',
      'projects',
      'skills',
      'education',
      'certifications',
      'languages',
      'contact',
    ]);
    expect(home.sections.map((section) => section.order)).toEqual([
      0, 10, 20, 30, 40, 50, 60, 70, 80,
    ]);
  });

  it('leaves other pages untouched', () => {
    const document = buildFullPortfolioDocument();
    const next = moveSection(document, 'page-home', 0, 1);

    expect(pageBySlug(next, 'projects')).toEqual(pageBySlug(document, 'projects'));
  });

  it('ignores an unknown page id', () => {
    const document = buildFullPortfolioDocument();

    expect(moveSection(document, 'page-missing', 0, 1)).toEqual(document);
  });

  it('produces a document that still validates', () => {
    const next = moveSection(buildFullPortfolioDocument(), 'page-home', 3, 0);
    const result = parseSchema(portfolioDocumentSchema, next);

    expect(result.ok).toBe(true);
  });
});

describe('setSectionVisibility', () => {
  it('hides one section on one page', () => {
    const next = setSectionVisibility(
      buildFullPortfolioDocument(),
      'page-home',
      'section-projects',
      false,
    );
    const home = pageBySlug(next, '');

    expect(home.sections.find((section) => section.id === 'section-projects')?.visible).toBe(false);
    expect(home.sections.find((section) => section.id === 'section-hero')?.visible).toBe(true);
  });

  it('ignores an unknown section id', () => {
    const document = buildFullPortfolioDocument();

    expect(setSectionVisibility(document, 'page-home', 'section-missing', false)).toEqual(document);
  });
});

describe('asset collection edits', () => {
  it('adds a gallery image only with owner-written alternative text', () => {
    const next = appendGalleryAsset(buildFullPortfolioDocument(), {
      assetId: 'asset-gallery-new',
      alt: 'Speaking at a TypeScript conference',
      caption: '',
    });

    expect(next.gallery.at(-1)).toMatchObject({
      assetId: 'asset-gallery-new',
      alt: 'Speaking at a TypeScript conference',
      caption: null,
    });
    expect(parseSchema(portfolioDocumentSchema, next).ok).toBe(true);
  });

  it('refuses to manufacture gallery alt text from a filename', () => {
    const document = buildFullPortfolioDocument();

    expect(
      appendGalleryAsset(document, {
        assetId: 'asset-gallery-new',
        alt: ' '.repeat(3),
        caption: '',
      }),
    ).toBe(document);
  });

  it('adds a visible downloadable CV with verified file metadata', () => {
    const next = appendAttachmentAsset(buildFullPortfolioDocument(), {
      assetId: 'asset-cv-new',
      kind: 'cv',
      label: 'Download my CV',
      fileName: 'amina-rahman.pdf',
      contentType: 'application/pdf',
      sizeBytes: 240_000,
    });

    expect(next.attachments.at(-1)).toMatchObject({
      assetId: 'asset-cv-new',
      kind: 'cv',
      label: 'Download my CV',
      visible: true,
    });
    expect(parseSchema(portfolioDocumentSchema, next).ok).toBe(true);
  });
});

describe('canonical collection edits', () => {
  it('adds, edits, reorders, and removes an identified entry immutably', () => {
    const document = buildFullPortfolioDocument();
    const added = appendCollectionItem(document, 'awards', {
      id: 'award-new',
      name: 'Systems prize',
      issuer: null,
      date: null,
      description: null,
    });
    const updated = updateCollectionItem(added, 'awards', 'award-new', { issuer: 'ACM' });
    const moved = moveCollectionItem(updated, 'awards', 0, 1);
    const removed = removeCollectionItem(moved, 'awards', 'award-new');

    expect(updated.awards.at(-1)?.issuer).toBe('ACM');
    expect(moved.awards[0]?.id).toBe('award-new');
    expect(removed.awards).toEqual(document.awards);
    expect(document.awards).toHaveLength(0);
  });

  it('normalizes interests and removes empty entries', () => {
    expect(
      setInterests(buildFullPortfolioDocument(), [' Running ', ' ', 'Typography']).interests,
    ).toEqual(['Running', 'Typography']);
  });

  it('creates an explicitly empty social entry and lets the owner write its URL', () => {
    const added = appendEmptyCollectionItem(
      buildFullPortfolioDocument(),
      'socialLinks',
      'social-new',
    );
    const updated = setCollectionPrimaryField(
      added,
      'socialLinks',
      'social-new',
      'https://example.com/me',
    );
    expect(added.socialLinks.at(-1)).toMatchObject({ kind: 'website', label: null, visible: true });
    expect(updated.socialLinks.at(-1)?.url).toBe('https://example.com/me');
  });

  it('edits nullable details, lists, booleans, and project paragraph content', () => {
    const document = buildFullPortfolioDocument();
    const withSummary = setCollectionField(document, 'experience', 'exp-1', 'summary', '');
    const withHighlights = setCollectionField(withSummary, 'experience', 'exp-1', 'highlights', [
      'One',
      'Two',
    ]);
    const withFeatured = setCollectionField(
      withHighlights,
      'projects',
      'proj-1',
      'featured',
      false,
    );
    const withContent = setCollectionField(withFeatured, 'projects', 'proj-1', 'content', [
      'First paragraph',
      'Second paragraph',
    ]);
    const withLinks = setCollectionField(withContent, 'projects', 'proj-1', 'links', [
      'Case study | https://example.com/case-study',
    ]);
    expect(withSummary.experience[0]?.summary).toBeNull();
    expect(withHighlights.experience[0]?.highlights).toEqual(['One', 'Two']);
    expect(withFeatured.projects[0]?.featured).toBe(false);
    expect(withContent.projects[0]?.content.map((block) => block.kind)).toEqual([
      'paragraph',
      'paragraph',
    ]);
    expect(withLinks.projects[0]?.links[0]).toMatchObject({
      label: 'Case study',
      url: 'https://example.com/case-study',
      visible: true,
    });
  });
});

describe('page edits', () => {
  it('places and removes gallery or attachment sections on an exact page', () => {
    const document = buildFullPortfolioDocument();
    const placed = setAssetSectionPlacement(document, 'page-projects', 'attachments', true);
    const untouchedPage = pageBySlug(placed, '');
    const targetPage = pageBySlug(placed, 'projects');

    expect(targetPage.sections.at(-1)).toMatchObject({
      type: 'attachments',
      visible: true,
      config: { title: null },
    });
    expect(setAssetSectionPlacement(placed, 'page-projects', 'attachments', true)).toEqual(placed);
    expect(untouchedPage.sections).toEqual(pageBySlug(document, '').sections);
    expect(
      setAssetSectionPlacement(placed, 'page-projects', 'attachments', false)
        .pages.find((page) => page.id === 'page-projects')
        ?.sections.some((section) => section.type === 'attachments'),
    ).toBe(false);
    expect(portfolioDocumentSchema.safeParse(placed).success).toBe(true);
  });

  it('places the first asset section on a page with no existing sections', () => {
    const document = createPage(buildFullPortfolioDocument(), {
      id: 'page-gallery',
      slug: 'gallery',
      title: 'Gallery',
      navLabel: 'Gallery',
    });
    const placed = setAssetSectionPlacement(document, 'page-gallery', 'gallery', true);

    expect(pageBySlug(placed, 'gallery').sections).toMatchObject([
      { type: 'gallery', order: 0, visible: true },
    ]);
  });

  it('creates a public page without accepting a client-side password hash', () => {
    const next = createPage(buildFullPortfolioDocument(), {
      id: 'page-speaking',
      slug: 'speaking',
      title: 'Speaking',
      navLabel: 'Speaking',
    });
    expect(next.pages.at(-1)).toMatchObject({
      slug: 'speaking',
      visibility: 'public',
      passwordHash: null,
      sections: [],
    });
  });

  it('edits, reorders, and deletes a subpage while preserving home', () => {
    const document = buildFullPortfolioDocument();
    const edited = editPage(document, 'page-projects', { navLabel: 'Work', visible: false });
    const moved = movePage(edited, 1, 0);
    const removed = removePage(moved, 'page-projects');
    expect(edited.pages[1]?.navLabel).toBe('Work');
    expect(moved.pages.map((page) => page.order)).toEqual([0, 10, 20]);
    expect(removed.pages.some((page) => page.slug === '')).toBe(true);
    expect(removePage(document, 'page-home')).toBe(document);
  });
});
