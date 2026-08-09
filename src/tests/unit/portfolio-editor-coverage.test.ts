import { describe, expect, it } from 'vitest';

import {
  appendAttachmentAsset,
  appendEmptyCollectionItem,
  appendGalleryAsset,
  collectionBooleanFieldValue,
  collectionTextFieldValue,
  formatCollectionEntry,
  isRequiredCollectionField,
  isStringArray,
  isStringRecord,
  moveItem,
  removeItem,
  setAvailabilityEnabled,
  setCollectionField,
  setCollectionPrimaryField,
  setSeoField,
} from '@/modules/portfolio-editor';

import { buildFullPortfolioDocument } from '../fixtures/portfolio-document.fixtures';

function requireValue<TValue>(value: TValue | null | undefined): TValue {
  expect(value).toBeDefined();
  expect(value).not.toBeNull();
  if (value === null || value === undefined) {
    throw new Error('Expected fixture value to exist');
  }
  return value;
}

describe('collection field shape', () => {
  it.each([
    ['experience', 'organization'],
    ['experience', 'title'],
    ['projects', 'name'],
    ['skills', 'label'],
    ['skills', 'tier'],
    ['softSkills', 'label'],
    ['softSkills', 'tier'],
    ['education', 'institution'],
    ['courses', 'name'],
    ['certifications', 'name'],
    ['languages', 'name'],
    ['awards', 'name'],
    ['publications', 'title'],
    ['volunteering', 'organization'],
    ['testimonials', 'quote'],
    ['testimonials', 'author'],
    ['socialLinks', 'kind'],
    ['socialLinks', 'url'],
  ] as const)(
    'keeps %s.%s present so validation can identify an empty required value',
    (key, field) => {
      expect(isRequiredCollectionField(key, field)).toBe(true);
    },
  );

  it.each([
    ['experience', 'summary'],
    ['projects', 'role'],
    ['skills', 'items'],
    ['softSkills', 'detail'],
    ['education', 'degree'],
    ['courses', 'provider'],
    ['certifications', 'issuer'],
    ['languages', 'proficiency'],
    ['awards', 'description'],
    ['publications', 'publisher'],
    ['volunteering', 'role'],
    ['testimonials', 'role'],
    ['socialLinks', 'label'],
  ] as const)('allows %s.%s to be absent', (key, field) => {
    expect(isRequiredCollectionField(key, field)).toBe(false);
  });

  it('formats only owner-visible strings, paragraphs, and labelled links', () => {
    expect(formatCollectionEntry('Written by the owner')).toBe('Written by the owner');
    expect(formatCollectionEntry({ kind: 'paragraph', text: 'A paragraph' })).toBe('A paragraph');
    expect(formatCollectionEntry({ label: 'Demo', url: 'https://example.test' })).toBe(
      'Demo | https://example.test',
    );
    expect(formatCollectionEntry({ kind: 'image', assetId: 'asset-1' })).toBe('');
    expect(formatCollectionEntry(null)).toBe('');
  });

  it('recognizes string arrays and non-null records without accepting mixed input', () => {
    expect(isStringArray([])).toBe(true);
    expect(isStringArray(['one', 'two'])).toBe(true);
    expect(isStringArray(['one', 2])).toBe(false);
    expect(isStringArray('one')).toBe(false);
    expect(isStringRecord({ value: 'one' })).toBe(true);
    expect(isStringRecord(null)).toBe(false);
    expect(isStringRecord('one')).toBe(false);
  });
});

describe('empty collection entries', () => {
  it.each([
    ['experience', 'organization'],
    ['projects', 'name'],
    ['skills', 'label'],
    ['softSkills', 'label'],
    ['education', 'institution'],
    ['courses', 'name'],
    ['certifications', 'name'],
    ['languages', 'name'],
    ['awards', 'name'],
    ['publications', 'title'],
    ['volunteering', 'organization'],
    ['testimonials', 'quote'],
    ['socialLinks', 'url'],
  ] as const)(
    'adds an explicit blank %s entry that the owner can name through %s',
    (key, field) => {
      const added = appendEmptyCollectionItem(buildFullPortfolioDocument(), key, `${key}-new`);
      const item = added[key].at(-1);

      expect(item?.id).toBe(`${key}-new`);
      expect(collectionTextFieldValue(requireValue(item), field)).toBe(
        key === 'socialLinks' ? 'https://' : '',
      );

      const edited = setCollectionPrimaryField(added, key, `${key}-new`, 'Owner supplied');
      expect(collectionTextFieldValue(requireValue(edited[key].at(-1)), field)).toBe(
        'Owner supplied',
      );
    },
  );
});

describe('collection field normalization', () => {
  it('keeps a blank required value for validation but removes an optional blank value', () => {
    const document = buildFullPortfolioDocument();
    const whitespace = ' '.repeat(3);
    const required = setCollectionField(
      document,
      'experience',
      'exp-1',
      'organization',
      whitespace,
    );
    const optional = setCollectionField(document, 'experience', 'exp-1', 'location', whitespace);

    expect(required.experience[0]?.organization).toBe(whitespace);
    expect(optional.experience[0]?.location).toBeNull();
  });

  it('ignores malformed project links while preserving their source-line positions in ids', () => {
    const next = setCollectionField(buildFullPortfolioDocument(), 'projects', 'proj-1', 'links', [
      'missing separator',
      '| https://example.test',
      'Label | ',
      ' Demo | https://example.test/demo ',
    ]);

    expect(next.projects[0]?.links).toEqual([
      {
        id: 'proj-1-link-3',
        kind: 'project',
        label: 'Demo',
        url: 'https://example.test/demo',
        visible: true,
      },
    ]);
  });

  it('leaves project content unchanged when the supplied value is not a string list', () => {
    const document = buildFullPortfolioDocument();
    const next = setCollectionField(document, 'projects', 'proj-1', 'content', null);

    expect(next.projects[0]?.content).toBeNull();
  });

  it('reads false for absent and non-boolean flags and preserves true flags', () => {
    const project = requireValue(buildFullPortfolioDocument().projects[0]);

    expect(collectionBooleanFieldValue(project, 'featured')).toBe(true);
    expect(collectionBooleanFieldValue(project, 'name')).toBe(false);
    expect(collectionBooleanFieldValue(project, 'missing')).toBe(false);
  });
});

describe('remaining immutable editor decisions', () => {
  it('rejects duplicate gallery and attachment references', () => {
    const document = buildFullPortfolioDocument();
    const galleryAssetId = requireValue(document.gallery[0]).assetId;
    const attachmentAssetId = requireValue(document.attachments[0]).assetId;

    expect(
      appendGalleryAsset(document, { assetId: galleryAssetId, alt: 'Different alt', caption: '' }),
    ).toBe(document);
    expect(
      appendAttachmentAsset(document, {
        assetId: attachmentAssetId,
        kind: 'cv',
        label: 'Different label',
        fileName: 'different.pdf',
        contentType: 'application/pdf',
        sizeBytes: 10,
      }),
    ).toBe(document);
  });

  it('rejects an attachment without an owner-written label', () => {
    const document = buildFullPortfolioDocument();

    expect(
      appendAttachmentAsset(document, {
        assetId: 'asset-new',
        kind: 'other',
        label: ' '.repeat(3),
        fileName: 'proof.pdf',
        contentType: 'application/pdf',
        sizeBytes: 10,
      }),
    ).toBe(document);
  });

  it('stores a caption and a nonblank SEO value exactly as written', () => {
    const document = buildFullPortfolioDocument();
    const gallery = appendGalleryAsset(document, {
      assetId: 'asset-new',
      alt: '  Conference stage  ',
      caption: ' Owner caption ',
    });
    const seo = setSeoField(document, 'description', ' Owner description ');

    expect(gallery.gallery.at(-1)).toMatchObject({
      alt: 'Conference stage',
      caption: ' Owner caption ',
    });
    expect(seo.seo.description).toBe(' Owner description ');
  });

  it('records availability independently of the owner-written note', () => {
    const document = buildFullPortfolioDocument();
    const next = setAvailabilityEnabled(document, false);

    expect(next.identity.availabilityEnabled).toBe(false);
    expect(next.identity.availabilityNote).toBe(document.identity.availabilityNote);
  });

  it('returns the original list for every invalid move and removal boundary', () => {
    const items = ['a', 'b'];

    expect(moveItem(items, 0, -1)).toBe(items);
    expect(moveItem(items, 2, 0)).toBe(items);
    expect(removeItem(items, -1)).toBe(items);
  });
});
