import { describe, expect, it } from 'vitest';

import { portfolioDocumentSchema } from '@/modules/portfolio-document';
import {
  moveItem,
  moveSection,
  removeItem,
  setContactValue,
  setContactVisibility,
  setIdentityField,
  setIndexable,
  setSectionVisibility,
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

describe('contact edits', () => {
  it('nulls an emptied channel value', () => {
    const next = setContactValue(buildFullPortfolioDocument(), 'email', '  ');

    expect(next.contact.email.value).toBeNull();
  });

  // Visibility is a separate decision from the value: clearing the address
  // should not silently re-expose it when the user types a new one.
  it('leaves visibility alone when the value changes', () => {
    const next = setContactValue(buildFullPortfolioDocument(), 'phone', '+20 100 000 0000');

    expect(next.contact.phone).toEqual({ value: '+20 100 000 0000', visible: false });
  });

  it('toggles visibility without touching the value', () => {
    const next = setContactVisibility(buildFullPortfolioDocument(), 'phone', true);

    expect(next.contact.phone.visible).toBe(true);
    expect(next.contact.phone.value).toBe('+351 000 000 000');
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
