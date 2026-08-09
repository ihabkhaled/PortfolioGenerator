import { describe, expect, it } from 'vitest';

import type { PortfolioSection } from '@/modules/portfolio-document';
import {
  buildCertificationEntries,
  buildEducationEntries,
  buildExperienceEntries,
  buildLanguageEntries,
  buildPortfolioLabels,
  formatDateRange,
  formatMonth,
  hasContent,
  joinNonEmpty,
  splitParagraphs,
  visibleLinks,
} from '@/modules/portfolio-renderer';

import {
  buildFullPortfolioDocument,
  buildMinimalPortfolioDocument,
} from '../fixtures/portfolio-document.fixtures';

describe('formatMonth', () => {
  it.each([
    ['2024-01', 'January 2024'],
    ['2024-12', 'December 2024'],
  ])('formats %s', (input, expected) => {
    expect(formatMonth(input)).toBe(expected);
  });

  it('returns null for an absent month', () => {
    expect(formatMonth(null)).toBeNull();
  });

  it.each(['2024', 'not-a-month', '2024-13', '2024-00', '2024-1', '2024-01-15', ''])(
    'returns null for the malformed value %j rather than a plausible wrong date',
    (input) => {
      expect(formatMonth(input)).toBeNull();
    },
  );

  it('does not shift a month across a timezone, unlike Date-based formatting', () => {
    // The bug this guards: `new Date('2024-01')` in a negative-offset zone is
    // December 2023, which would silently rewrite someone's employment dates.
    expect(formatMonth('2024-01')).toBe('January 2024');
  });
});

describe('formatDateRange', () => {
  it('renders a closed range', () => {
    expect(formatDateRange('2020-06', '2023-02', false, 'Present')).toBe(
      'June 2020 — February 2023',
    );
  });

  it('renders a current role with the present label', () => {
    expect(formatDateRange('2023-03', null, true, 'Present')).toBe('March 2023 — Present');
  });

  it('renders a start date alone', () => {
    expect(formatDateRange('2023-03', null, false, 'Present')).toBe('March 2023');
  });

  it('renders an end date alone', () => {
    expect(formatDateRange(null, '2023-03', false, 'Present')).toBe('March 2023');
  });

  it('renders nothing when there are no dates, rather than a floating dash', () => {
    expect(formatDateRange(null, null, false, 'Present')).toBe('');
  });
});

describe('joinNonEmpty', () => {
  it('joins the present values', () => {
    expect(joinNonEmpty(['BSc', 'Computer Science'], ', ')).toBe('BSc, Computer Science');
  });

  it('skips nulls and blanks', () => {
    expect(joinNonEmpty([null, '  ', 'BSc'], ', ')).toBe('BSc');
  });

  it('returns null when nothing is present', () => {
    expect(joinNonEmpty([null, ' '.repeat(3)], ', ')).toBeNull();
  });
});

describe('splitParagraphs', () => {
  it('splits on newlines and drops blank lines', () => {
    expect(splitParagraphs('One.\n\n  Two.  \n')).toEqual(['One.', 'Two.']);
  });

  it('returns an empty list for empty text', () => {
    expect(splitParagraphs('')).toEqual([]);
  });
});

describe('collection builders', () => {
  const document = buildFullPortfolioDocument();

  it('builds experience entries with formatted ranges', () => {
    const entries = buildExperienceEntries(document, null, 'Present');

    expect(entries).toHaveLength(2);
    expect(entries[0]?.dateRange).toBe('March 2023 — Present');
  });

  it('honours a section limit', () => {
    expect(buildExperienceEntries(document, 1, 'Present')).toHaveLength(1);
  });

  it('combines degree and field into one subtitle', () => {
    expect(buildEducationEntries(document)[0]?.subtitle).toBe('BSc, Computer Science');
  });

  it('exposes a credential URL as the entry link', () => {
    expect(buildCertificationEntries(document)[0]?.link).toBe('https://example.com/credential/cka');
  });

  it('maps languages to title and proficiency', () => {
    expect(buildLanguageEntries(document)[0]).toMatchObject({
      title: 'Portuguese',
      subtitle: 'Native',
    });
  });
});

describe('visibleLinks', () => {
  it('returns only links the user chose to show', () => {
    expect(visibleLinks(buildFullPortfolioDocument()).map((link) => link.id)).toEqual([
      'link-code',
    ]);
  });
});

function section<TType extends PortfolioSection['type']>(
  type: TType,
  config: Extract<PortfolioSection, { type: TType }>['config'],
): PortfolioSection {
  return { id: `s-${type}`, type, visible: true, order: 0, config } as PortfolioSection;
}

describe('hasContent', () => {
  const full = buildFullPortfolioDocument();
  const minimal = buildMinimalPortfolioDocument();

  it('always renders the hero, because a portfolio is a person', () => {
    expect(
      hasContent(section('hero', { showPortrait: false, showAvailability: false }), minimal),
    ).toBe(true);
  });

  it.each([
    ['about', { title: null }],
    ['skills', { title: null }],
    ['education', { title: null }],
    ['certifications', { title: null }],
    ['languages', { title: null }],
  ] as const)('reports %s as empty on a new portfolio', (type, config) => {
    expect(hasContent(section(type, config), minimal)).toBe(false);
  });

  it.each([
    ['experience', { title: null, limit: null }],
    ['projects', { title: null, limit: null }],
  ] as const)('reports %s as empty on a new portfolio', (type, config) => {
    expect(hasContent(section(type, config), minimal)).toBe(false);
  });

  it.each([
    ['about', { title: null }],
    ['skills', { title: null }],
    ['education', { title: null }],
    ['certifications', { title: null }],
    ['languages', { title: null }],
  ] as const)('reports %s as present on the full fixture', (type, config) => {
    expect(hasContent(section(type, config), full)).toBe(true);
  });

  it('reports a contact section as empty when every channel is hidden', () => {
    expect(
      hasContent(
        section('contact', { title: null, showEmail: false, showPhone: false, showLinks: false }),
        full,
      ),
    ).toBe(false);
  });

  it('reports a contact section as present when the email is visible', () => {
    expect(
      hasContent(
        section('contact', { title: null, showEmail: true, showPhone: false, showLinks: false }),
        full,
      ),
    ).toBe(true);
  });

  it('reports a contact section as present when only links are shown', () => {
    expect(
      hasContent(
        section('contact', { title: null, showEmail: false, showPhone: false, showLinks: true }),
        full,
      ),
    ).toBe(true);
  });

  it('reports a contact section as present when only a visible phone is shown', () => {
    const withPhone = {
      ...full,
      contact: {
        ...full.contact,
        phone: { countryIso: 'PT', nationalNumber: '000 000 000', visible: true },
      },
    };

    expect(
      hasContent(
        section('contact', { title: null, showEmail: false, showPhone: true, showLinks: false }),
        withPhone,
      ),
    ).toBe(true);
  });

  it('reports an empty custom section as empty', () => {
    expect(hasContent(section('custom', { title: null, blocks: [] }), full)).toBe(false);
  });

  it('reports a custom section with blocks as present', () => {
    expect(
      hasContent(
        section('custom', {
          title: null,
          blocks: [{ id: 'b', kind: 'paragraph', text: 'Hello.' }],
        }),
        full,
      ),
    ).toBe(true);
  });

  it('reports a skills section with only empty groups as empty', () => {
    const emptyGroups = {
      ...full,
      skills: [{ id: 'g', label: 'Group', tier: 'working' as const, items: [] }],
    };

    expect(hasContent(section('skills', { title: null }), emptyGroups)).toBe(false);
  });

  it('reports an about section with a whitespace-only summary as empty', () => {
    const blankSummary = { ...full, identity: { ...full.identity, summary: ' '.repeat(3) } };

    expect(hasContent(section('about', { title: null }), blankSummary)).toBe(false);
  });
});

describe('buildPortfolioLabels', () => {
  it('resolves every chrome label through the translator', () => {
    const labels = buildPortfolioLabels((key) => `t:${key}`);

    expect(labels.sections.experience).toBe('t:sections.experience');
    expect(labels.present).toBe('t:present');
    expect(Object.keys(labels.sections)).toHaveLength(10);
  });
});
