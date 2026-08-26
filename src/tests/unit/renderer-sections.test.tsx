import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type {
  PortfolioCustomBlock,
  PortfolioDocument,
  PortfolioSection,
} from '@/modules/portfolio-document';
import {
  buildPortfolioLabels,
  PortfolioTemplate,
  SectionRenderer,
} from '@/modules/portfolio-renderer';

import { buildFullPortfolioDocument } from '../fixtures/portfolio-document.fixtures';

/**
 * One section at a time, with the optional parts present and absent.
 *
 * The whole-template matrix proves the page holds together; this proves each
 * band omits what is missing instead of rendering an empty element with a
 * heading above it — the failure mode a reviewer reads as "extraction lost it".
 */

const labels = buildPortfolioLabels((key: string) => key);
const buildPrivateAssetPath = (assetId: string): string => `/private-media/${assetId}`;

function findImportedSectionContent(
  type: PortfolioSection['type'],
  expected: string | RegExp,
): HTMLElement | null {
  switch (type) {
    case 'gallery': {
      return screen.queryByRole('img', { name: expected });
    }
    case 'attachments':
    case 'social': {
      return screen.queryByRole('link', { name: expected });
    }
    case 'courses':
    case 'publications': {
      return screen.queryAllByText(expected).at(0) ?? null;
    }
    default: {
      return screen.queryByText(expected);
    }
  }
}

function renderSection(section: PortfolioSection, document = buildFullPortfolioDocument()): void {
  render(<SectionRenderer section={section} document={document} labels={labels} />);
}

function hero(config: Partial<{ showPortrait: boolean; showAvailability: boolean }> = {}) {
  return {
    id: 'section-hero',
    type: 'hero',
    visible: true,
    order: 0,
    config: { showPortrait: false, showAvailability: true, ...config },
  } satisfies PortfolioSection;
}

function contact(
  config: Partial<{ showEmail: boolean; showPhone: boolean; showLinks: boolean }> = {},
) {
  return {
    id: 'section-contact',
    type: 'contact',
    visible: true,
    order: 0,
    config: { title: null, showEmail: true, showPhone: false, showLinks: true, ...config },
  } satisfies PortfolioSection;
}

function custom(blocks: PortfolioCustomBlock[]) {
  return {
    id: 'section-custom',
    type: 'custom',
    visible: true,
    order: 0,
    config: { title: null, blocks },
  } satisfies PortfolioSection;
}

describe('the hero band', () => {
  it('renders the owner-written welcome tagline', () => {
    renderSection(hero());

    expect(
      screen.getByText('Open to staff-level backend work, remote or Lisbon-based.'),
    ).toBeInTheDocument();
  });

  it('orders contact evidence before social profiles and uses a dialable phone link', () => {
    const document = buildFullPortfolioDocument();
    renderSection(hero(), {
      ...document,
      identity: { ...document.identity, location: 'Cairo, Egypt' },
      contact: {
        ...document.contact,
        email: { value: 'ihab@example.com', visible: true },
        phone: { countryIso: 'EG', nationalNumber: '0100 123 4567', visible: true },
      },
      socialLinks: [
        {
          id: 'github',
          kind: 'github',
          label: 'GitHub',
          url: 'https://github.com/ihab',
          visible: true,
        },
      ],
    });

    const location = screen.getByText('Cairo, Egypt');
    const email = screen.getByRole('link', { name: 'ihab@example.com' });
    const phone = screen.getByRole('link', { name: /0100 123 4567/ });
    const social = screen.getByRole('link', { name: 'GitHub' });
    expect(location.compareDocumentPosition(email)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(email.compareDocumentPosition(phone)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(phone.compareDocumentPosition(social)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(phone).toHaveAttribute('href', 'tel:+2001001234567');
  });

  it('shows the availability note when both the section and the person allow it', () => {
    renderSection(hero());

    expect(screen.getByText('availability — Available from March')).toBeInTheDocument();
  });

  it('hides the availability note when the section turns it off', () => {
    renderSection(hero({ showAvailability: false }));

    expect(screen.queryByText('availability')).not.toBeInTheDocument();
  });

  // Availability is the person's claim, not the template's.
  it('hides the availability note when the person turned it off', () => {
    const document = buildFullPortfolioDocument();

    renderSection(hero(), {
      ...document,
      identity: { ...document.identity, availabilityEnabled: false },
    });

    expect(screen.queryByText('availability')).not.toBeInTheDocument();
  });

  it('renders a portrait only when one was uploaded and the section asks for it', () => {
    const document = buildFullPortfolioDocument();

    renderSection(hero({ showPortrait: true }), {
      ...document,
      identity: { ...document.identity, portraitAssetId: 'asset-1' },
    });

    expect(screen.getByRole('img', { name: 'portraitAlt' })).toBeInTheDocument();
  });

  it('renders no portrait when the section asks for one that does not exist', () => {
    renderSection(hero({ showPortrait: true }));

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  // A portfolio with no location should not advertise the gap.
  it('omits the evidence panel when there is nothing to put in it', () => {
    const document = buildFullPortfolioDocument();

    renderSection(hero(), {
      ...document,
      identity: { ...document.identity, location: null },
      contact: { ...document.contact, email: { value: null, visible: false } },
    });

    expect(screen.queryByLabelText('contactCta')).not.toBeInTheDocument();
  });

  it('includes location and a visible email in the evidence panel', () => {
    renderSection(hero());

    const panel = screen.getByLabelText('contactCta');

    expect(within(panel).getByText('Lisbon, Portugal')).toBeInTheDocument();
    expect(within(panel).getByText('amina@example.com')).toBeInTheDocument();
  });

  it('shows a visible phone even when no country flag can be derived', () => {
    const document = buildFullPortfolioDocument();

    renderSection(hero(), {
      ...document,
      contact: {
        ...document.contact,
        phone: { countryIso: null, nationalNumber: '555 0100', visible: true },
      },
    });

    expect(screen.getByRole('link', { name: '555 0100' })).toHaveAttribute('href', 'tel:5550100');
  });

  it('shows a visible phone with its country badge in the hero evidence', () => {
    const document = buildFullPortfolioDocument();
    renderSection(hero(), {
      ...document,
      contact: {
        ...document.contact,
        phone: { countryIso: 'PT', nationalNumber: '000 000 000', visible: true },
      },
    });

    expect(screen.getByRole('link', { name: '(+351) 000 000 000' })).toHaveAttribute(
      'href',
      'tel:+351000000000',
    );
  });

  it('keeps a human-entered phone visible when it has no dialable digits', () => {
    const document = buildFullPortfolioDocument();
    renderSection(hero(), {
      ...document,
      contact: {
        ...document.contact,
        phone: { countryIso: null, nationalNumber: '---', visible: true },
      },
    });

    expect(screen.getByText('---')).not.toHaveAttribute('href');
  });
});

describe('public page section order', () => {
  it('renders imported sections in the stored page order', () => {
    const document = buildFullPortfolioDocument();
    render(
      <PortfolioTemplate
        document={document}
        sections={[
          {
            id: 'section-projects',
            type: 'projects',
            visible: true,
            order: 2,
            config: { title: 'Projects', limit: null },
          },
          {
            id: 'section-about',
            type: 'about',
            visible: true,
            order: 1,
            config: { title: 'About' },
          },
        ]}
        navigation={[]}
        labels={labels}
        portfolioSlug="amina"
        pageTitle="Amina"
        isPreview={false}
        actions={null}
        footerLinks={null}
      />,
    );

    const pageText = screen.getByTestId('portfolio-section-page').textContent;
    expect(pageText.indexOf('About')).toBeLessThan(pageText.indexOf('Projects'));
  });
});

describe('the contact band', () => {
  it('lists the channels the author chose to show', () => {
    renderSection(contact());

    expect(screen.getByRole('link', { name: 'amina@example.com' })).toHaveAttribute(
      'href',
      'mailto:amina@example.com',
    );
    expect(screen.queryByText('(+351) 000 000 000')).not.toBeInTheDocument();
  });

  // Two switches have to both be on: the section's, and the field's.
  it('still hides a phone number the section would show but the author would not', () => {
    renderSection(contact({ showPhone: true }));

    expect(screen.queryByText('(+351) 000 000 000')).not.toBeInTheDocument();
  });

  it('shows a phone number when both switches are on', () => {
    const document = buildFullPortfolioDocument();

    renderSection(contact({ showPhone: true }), {
      ...document,
      contact: {
        ...document.contact,
        phone: { countryIso: 'PT', nationalNumber: '000 000 000', visible: true },
      },
    });

    // The flag sits in its own `aria-hidden` badge (see `contactClasses.phoneFlag`)
    // so a screen reader announces the dialable number alone, while the link's
    // full text content — what a sighted reader sees — still reads as one
    // continuous string with the flag in front of it.
    const phoneLink = screen.getByRole('link', { name: '(+351) 000 000 000' });

    expect(phoneLink).toHaveAttribute('href', 'tel:+351000000000');
    expect(phoneLink).toHaveTextContent('🇵🇹 (+351) 000 000 000');
  });

  it('omits the link row when the section turns links off', () => {
    renderSection(contact({ showLinks: false }));

    expect(screen.queryByRole('link', { name: 'Code' })).not.toBeInTheDocument();
  });

  it('renders a country-free phone number without an empty badge', () => {
    const document = buildFullPortfolioDocument();
    renderSection(contact({ showPhone: true }), {
      ...document,
      contact: {
        ...document.contact,
        phone: { countryIso: null, nationalNumber: '555 0100', visible: true },
      },
    });

    expect(screen.getByRole('link', { name: '555 0100' })).toHaveAttribute('href', 'tel:5550100');
  });

  it.each([
    [{ showEmail: false }, { value: 'amina@example.com', visible: true }],
    [{ showEmail: true }, { value: 'amina@example.com', visible: false }],
    [{ showEmail: true }, { value: null, visible: true }],
  ] as const)('omits email unless every visibility condition is met', (config, email) => {
    const document = buildFullPortfolioDocument();

    renderSection(contact(config), {
      ...document,
      contact: { ...document.contact, email },
    });

    expect(screen.queryByRole('link', { name: 'amina@example.com' })).not.toBeInTheDocument();
  });
});

describe('the custom band', () => {
  it('renders each block kind with its own element', () => {
    renderSection(
      custom([
        { id: 'b1', kind: 'paragraph', text: 'A paragraph.' },
        { id: 'b2', kind: 'bullet-list', items: ['First', 'Second'] },
        { id: 'b3', kind: 'stat-list', items: [{ id: 's1', label: 'Shipped', value: '2' }] },
        {
          id: 'b4',
          kind: 'links',
          items: [
            {
              id: 'l1',
              kind: 'code',
              label: 'Repository',
              url: 'https://example.com/repo',
              visible: true,
            },
          ],
        },
      ]),
    );

    expect(screen.getByText('A paragraph.')).toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Shipped')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Repository' })).toBeInTheDocument();
  });

  it('renders an empty block list without an empty container of text', () => {
    renderSection(custom([]));

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('the fact-list bands', () => {
  it('links a certification credential and shows the bare host', () => {
    renderSection({
      id: 'section-certifications',
      type: 'certifications',
      visible: true,
      order: 0,
      config: { title: null },
    });

    expect(
      screen.getByRole('link', { name: /^example\.com\/credential\/cka$/u }),
    ).toBeInTheDocument();
  });

  it('renders an education entry that has no link', () => {
    renderSection({
      id: 'section-education',
      type: 'education',
      visible: true,
      order: 0,
      config: { title: null },
    });

    expect(screen.getByText('University of Lisbon')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders languages with their proficiency', () => {
    renderSection({
      id: 'section-languages',
      type: 'languages',
      visible: true,
      order: 0,
      config: { title: null },
    });

    expect(screen.getByText('Portuguese')).toBeInTheDocument();
  });

  it('renders a publication without a URL as plain text', () => {
    const document = buildFullPortfolioDocument();
    renderSection(
      {
        id: 'publications',
        type: 'publications',
        visible: true,
        order: 0,
        config: { title: null },
      },
      {
        ...document,
        publications: document.publications.map((entry) => ({ ...entry, url: null })),
      },
    );

    expect(screen.getByText('Reconciling a ledger you did not design')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('the imported collection bands', () => {
  it('renders every supported social channel with its default label', () => {
    const document = buildFullPortfolioDocument();
    const kinds = [
      'github',
      'gitlab',
      'behance',
      'linkedin',
      'youtube',
      'tiktok',
      'instagram',
      'facebook',
      'x',
      'threads',
      'dribbble',
      'stackoverflow',
      'telegram',
      'whatsapp',
      'medium',
      'website',
      'mastodon',
      'bluesky',
    ] as const;

    renderSection(
      { id: 'section-social', type: 'social', visible: true, order: 0, config: { title: null } },
      {
        ...document,
        socialLinks: kinds.map((kind) => ({
          id: `social-${kind}`,
          kind,
          label: null,
          url: `https://example.com/${kind}`,
          visible: true,
        })),
      },
    );

    for (const label of [
      'GitHub',
      'GitLab',
      'Behance',
      'LinkedIn',
      'YouTube',
      'TikTok',
      'Instagram',
      'Facebook',
      'X',
      'Threads',
      'Dribbble',
      'Stack Overflow',
      'Telegram',
      'WhatsApp',
      'Medium',
      'Website',
      'Mastodon',
      'Bluesky',
    ]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it.each([
    ['soft-skills', 'Writing things down'],
    ['courses', 'Distributed Systems'],
    ['publications', 'Reconciling a ledger you did not design'],
    ['volunteering', 'Code Club Lisbon'],
    ['interests', 'Long-distance running'],
    ['testimonials', /rounding bug/],
    ['gallery', /settlement state machine/i],
    ['attachments', /Curriculum vitae/],
    ['social', 'GitHub'],
  ] as const)('renders the dedicated %s section', (type, expected) => {
    renderSection({
      id: `section-${type}`,
      type,
      visible: true,
      order: 0,
      config: { title: null },
    });

    expect(findImportedSectionContent(type, expected)).toBeInTheDocument();
  });

  it('renders the dedicated awards section', () => {
    const document = buildFullPortfolioDocument();
    renderSection(
      { id: 'section-awards', type: 'awards', visible: true, order: 0, config: { title: null } },
      {
        ...document,
        awards: [
          {
            id: 'award-1',
            name: 'Reliability award',
            issuer: 'Northwind Payments',
            date: '2024-06',
            description: 'For recoverable settlements.',
          },
        ],
      },
    );

    expect(screen.getByText('Reliability award')).toBeInTheDocument();
  });

  it('uses the private page asset builder for gallery images and attachments', () => {
    const document = buildFullPortfolioDocument();
    const { rerender } = render(
      <SectionRenderer
        section={{
          id: 'gallery',
          type: 'gallery',
          visible: true,
          order: 0,
          config: { title: null },
        }}
        document={document}
        labels={labels}
        buildAssetPath={buildPrivateAssetPath}
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      expect.stringContaining('private-media'),
    );

    rerender(
      <SectionRenderer
        section={{
          id: 'attachments',
          type: 'attachments',
          visible: true,
          order: 0,
          config: { title: null },
        }}
        document={document}
        labels={labels}
        buildAssetPath={buildPrivateAssetPath}
      />,
    );
    expect(screen.getByRole('link', { name: /Curriculum vitae/ })).toHaveAttribute(
      'href',
      '/private-media/asset-cv',
    );
  });

  it('omits a missing caption in the dedicated gallery section', () => {
    const document = buildFullPortfolioDocument();
    renderSection(
      { id: 'gallery', type: 'gallery', visible: true, order: 0, config: { title: null } },
      { ...document, gallery: document.gallery.map((entry) => ({ ...entry, caption: null })) },
    );

    expect(screen.getByRole('img', { name: /settlement state machine/i })).toBeInTheDocument();
    expect(
      screen.queryByText('The settlement state machine, before it was code'),
    ).not.toBeInTheDocument();
  });
});

describe('the projects band', () => {
  it('lays cards into independent columns instead of shared grid rows', () => {
    renderSection({
      id: 'section-projects',
      type: 'projects',
      visible: true,
      order: 0,
      config: { title: null, limit: null },
    });

    const list = screen.getByTestId('project-card-list');
    const card = screen.getAllByRole('article')[0];
    expect(list).toHaveClass('columns-1');
    expect(card).toHaveClass('break-inside-avoid');
    expect(list).not.toHaveClass('grid');
  });

  it('renders every project when no limit is set', () => {
    renderSection({
      id: 'section-projects',
      type: 'projects',
      visible: true,
      order: 0,
      config: { title: null, limit: null },
    });

    expect(screen.getByText('Ledger Replay')).toBeInTheDocument();
    expect(screen.getByText('Budget Alarm')).toBeInTheDocument();
  });

  // A limit is the author saying "show my best two", not a pagination bug.
  it('honours a limit', () => {
    renderSection({
      id: 'section-projects',
      type: 'projects',
      visible: true,
      order: 0,
      config: { title: null, limit: 1 },
    });

    expect(screen.getByText('Ledger Replay')).toBeInTheDocument();
    expect(screen.queryByText('Budget Alarm')).not.toBeInTheDocument();
  });
});

describe('the experience band', () => {
  it('honours a limit', () => {
    renderSection({
      id: 'section-experience',
      type: 'experience',
      visible: true,
      order: 0,
      config: { title: null, limit: 1 },
    });

    expect(screen.getByText('Northwind Payments')).toBeInTheDocument();
    expect(screen.queryByText('Harbour Analytics')).not.toBeInTheDocument();
  });

  it('omits the supplemental volunteering band when there are no entries', () => {
    const document = buildFullPortfolioDocument();
    renderSection(
      {
        id: 'section-experience',
        type: 'experience',
        visible: true,
        order: 0,
        config: { title: null, limit: null },
      },
      { ...document, volunteering: [] },
    );

    expect(screen.queryByText('supplemental.volunteering')).not.toBeInTheDocument();
  });
});

describe('the skills band', () => {
  it('lets a single skill group consume the complete panel', () => {
    const document = buildFullPortfolioDocument();
    renderSection(
      { id: 'section-skills', type: 'skills', visible: true, order: 0, config: { title: null } },
      {
        ...document,
        skills: [{ id: 'skills-1', label: 'Languages', tier: 'primary', items: ['TypeScript'] }],
        softSkills: [],
      },
    );

    const list = screen.getByTestId('skill-group-list');
    expect(list).toHaveClass('grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]');
    expect(list).not.toHaveClass('sm:grid-cols-2');
  });

  it('omits a group the author emptied', () => {
    const document: PortfolioDocument = {
      ...buildFullPortfolioDocument(),
      skills: [
        { id: 'skills-1', label: 'Languages', tier: 'primary', items: ['TypeScript'] },
        { id: 'skills-2', label: 'Empty', tier: 'working', items: [] },
      ],
    };

    renderSection(
      { id: 'section-skills', type: 'skills', visible: true, order: 0, config: { title: null } },
      document,
    );

    expect(screen.getByText('Languages')).toBeInTheDocument();
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
  });

  it('omits the supplemental soft-skills band when there are no entries', () => {
    const document = buildFullPortfolioDocument();
    renderSection(
      { id: 'section-skills', type: 'skills', visible: true, order: 0, config: { title: null } },
      { ...document, softSkills: [] },
    );

    expect(screen.queryByText('supplemental.softSkills')).not.toBeInTheDocument();
  });
});

describe('the about band', () => {
  it('splits a multi-paragraph summary', () => {
    renderSection({
      id: 'section-about',
      type: 'about',
      visible: true,
      order: 0,
      config: { title: null },
    });

    expect(screen.getAllByText(/payment systems|idempotency/).length).toBeGreaterThan(0);
  });

  it('renders nothing readable when there is no summary', () => {
    const document = buildFullPortfolioDocument();

    renderSection(
      { id: 'section-about', type: 'about', visible: true, order: 0, config: { title: null } },
      { ...document, identity: { ...document.identity, summary: null } },
    );

    expect(screen.queryByText(/payment systems/)).not.toBeInTheDocument();
  });

  it('renders the optional evidence collections attached to an about section', () => {
    const document = buildFullPortfolioDocument();

    renderSection(
      { id: 'section-about', type: 'about', visible: true, order: 0, config: { title: null } },
      {
        ...document,
        awards: [
          {
            id: 'award-1',
            name: 'Reliability award',
            issuer: 'Northwind Payments',
            date: '2024-06',
            description: 'For making settlement failures recoverable.',
          },
        ],
      },
    );

    expect(screen.getAllByText('Reconciling a ledger you did not design')).toHaveLength(2);
    expect(screen.getByText('Reliability award')).toBeInTheDocument();
    expect(screen.getByText('Long-distance running')).toBeInTheDocument();
    expect(screen.getByText(/rounding bug/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /settlement state machine/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Curriculum vitae/ })).toBeInTheDocument();
    expect(screen.getByText(/I have spent eight years/)).toBeInTheDocument();
    expect(screen.getByText('availability — Available from March')).toBeInTheDocument();
  });

  it('omits a gallery caption that was not supplied', () => {
    const document = buildFullPortfolioDocument();

    renderSection(
      { id: 'section-about', type: 'about', visible: true, order: 0, config: { title: null } },
      {
        ...document,
        gallery: document.gallery.map((entry) => ({ ...entry, caption: null })),
      },
    );

    expect(screen.getByRole('img', { name: /settlement state machine/i })).toBeInTheDocument();
    expect(
      screen.queryByText('The settlement state machine, before it was code'),
    ).not.toBeInTheDocument();
  });

  it('omits every optional evidence collection when each one is empty or hidden', () => {
    const document = buildFullPortfolioDocument();

    renderSection(
      { id: 'section-about', type: 'about', visible: true, order: 0, config: { title: null } },
      {
        ...document,
        publications: [],
        awards: [],
        interests: [],
        testimonials: [],
        gallery: [],
        attachments: document.attachments.map((entry) => ({ ...entry, visible: false })),
      },
    );

    expect(screen.queryByText(/^supplemental\./)).not.toBeInTheDocument();
  });
});

describe('bands rendered from entries with nothing optional filled in', () => {
  // An entry stripped to its required fields still has to render as a row, not
  // as a stack of empty elements with headings above them.
  const bare: PortfolioDocument = {
    ...buildFullPortfolioDocument(),
    experience: [
      {
        id: 'exp-bare',
        organization: 'Northwind Payments',
        title: 'Engineer',
        location: null,
        startDate: null,
        endDate: null,
        current: false,
        summary: null,
        highlights: [],
        technologies: [],
      },
    ],
    projects: [
      {
        id: 'proj-bare',
        slug: null,
        name: 'Budget Alarm',
        role: null,
        year: null,
        coverAssetId: null,
        featured: false,
        summary: null,
        highlights: [],
        technologies: [],
        links: [],
        content: [],
      },
    ],
    education: [
      {
        id: 'edu-bare',
        institution: 'University of Lisbon',
        degree: null,
        field: null,
        startDate: null,
        endDate: null,
        location: null,
        details: null,
      },
    ],
    certifications: [
      { id: 'cert-bare', name: 'CKA', issuer: null, date: null, credentialUrl: null },
    ],
    courses: [],
    languages: [{ id: 'lang-bare', name: 'Portuguese', proficiency: null }],
  };

  it('renders a role with no dates, summary, highlights or technologies', () => {
    renderSection(
      {
        id: 'section-experience',
        type: 'experience',
        visible: true,
        order: 0,
        config: { title: null, limit: null },
      },
      bare,
    );

    expect(screen.getByText('Northwind Payments')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders a project with nothing but a name', () => {
    renderSection(
      {
        id: 'section-projects',
        type: 'projects',
        visible: true,
        order: 0,
        config: { title: null, limit: null },
      },
      bare,
    );

    expect(screen.getByText('Budget Alarm')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders an education entry with only an institution', () => {
    renderSection(
      {
        id: 'section-education',
        type: 'education',
        visible: true,
        order: 0,
        config: { title: null },
      },
      bare,
    );

    expect(screen.getByText('University of Lisbon')).toBeInTheDocument();
  });

  it('renders a certification with no issuer, date or credential', () => {
    renderSection(
      {
        id: 'section-certifications',
        type: 'certifications',
        visible: true,
        order: 0,
        config: { title: null },
      },
      bare,
    );

    expect(screen.getByText('CKA')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a language with no stated proficiency', () => {
    renderSection(
      {
        id: 'section-languages',
        type: 'languages',
        visible: true,
        order: 0,
        config: { title: null },
      },
      bare,
    );

    expect(screen.getByText('Portuguese')).toBeInTheDocument();
  });

  it('renders a hero for someone with no links at all', () => {
    renderSection(hero(), { ...bare, socialLinks: [] });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Amina Rahman');
    expect(screen.queryByTestId('hero-social-links')).not.toBeInTheDocument();
  });
});
