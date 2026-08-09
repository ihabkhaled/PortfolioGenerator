import {
  createEmptyPortfolioDocument,
  DEFAULT_TEMPLATE_ID,
  PORTFOLIO_SCHEMA_VERSION,
  type PortfolioDocument,
  type PortfolioPage,
  type PortfolioSection,
} from '@/modules/portfolio-document';

/**
 * Synthetic portfolio fixtures, shared by the unit suite, the E2E suite and the
 * development seed.
 *
 * Everything here is invented. A real CV in a repository is a privacy incident
 * waiting for someone to clone it, and the launch checklist asserts no real one
 * is present.
 *
 * The set is chosen to cover the states the template actually has to survive:
 * a full document, a nearly-empty one, and one with content long enough to
 * break a layout that assumed short strings.
 */

export const HOME_SECTIONS: readonly PortfolioSection[] = [
  {
    id: 'section-hero',
    type: 'hero',
    visible: true,
    order: 0,
    config: { showPortrait: false, showAvailability: true },
  },
  { id: 'section-about', type: 'about', visible: true, order: 10, config: { title: null } },
  {
    id: 'section-experience',
    type: 'experience',
    visible: true,
    order: 20,
    config: { title: null, limit: null },
  },
  {
    id: 'section-projects',
    type: 'projects',
    visible: true,
    order: 30,
    config: { title: null, limit: null },
  },
  { id: 'section-skills', type: 'skills', visible: true, order: 40, config: { title: null } },
  { id: 'section-education', type: 'education', visible: true, order: 50, config: { title: null } },
  {
    id: 'section-certifications',
    type: 'certifications',
    visible: true,
    order: 60,
    config: { title: null },
  },
  { id: 'section-languages', type: 'languages', visible: true, order: 70, config: { title: null } },
  {
    id: 'section-contact',
    type: 'contact',
    visible: true,
    order: 80,
    config: { title: null, showEmail: true, showPhone: false, showLinks: true },
  },
];

export const PROJECTS_PAGE: PortfolioPage = {
  id: 'page-projects',
  slug: 'projects',
  title: 'Projects',
  navLabel: 'Projects',
  description: null,
  visible: true,
  visibility: 'public',
  passwordHash: null,
  order: 10,
  sections: [
    {
      id: 'section-projects-page',
      type: 'projects',
      visible: true,
      order: 0,
      config: { title: 'Selected work', limit: null },
    },
    {
      id: 'section-projects-note',
      type: 'custom',
      visible: true,
      order: 10,
      config: {
        title: 'How to read this',
        blocks: [
          {
            id: 'block-note',
            kind: 'paragraph',
            text: 'Each project lists what was built and the constraint that made it interesting.',
          },
          {
            id: 'block-stats',
            kind: 'stat-list',
            items: [
              { id: 'stat-shipped', label: 'Shipped', value: '2 projects' },
              { id: 'stat-stack', label: 'Primary stack', value: 'TypeScript' },
            ],
          },
        ],
      },
    },
  ],
};

export function buildFullPortfolioDocument(): PortfolioDocument {
  return {
    schemaVersion: PORTFOLIO_SCHEMA_VERSION,
    identity: {
      displayName: 'Amina Rahman',
      headline: 'Backend engineer, payments and reliability',
      summary:
        'Backend engineer working on payment systems.\nI care about the boring parts: idempotency, reconciliation, and error budgets that someone actually reads.',
      location: 'Lisbon, Portugal',
      portraitAssetId: null,
      availabilityEnabled: true,
      tagline: 'Open to staff-level backend work, remote or Lisbon-based.',
      availabilityNote: 'Available from March',
      coverLetter:
        'I have spent eight years on the parts of a payment system nobody demos: reconciliation, idempotency, and the error budget somebody actually reads.\nIf that sounds like the problem you have, I would like to talk.',
    },
    contact: {
      email: { value: 'amina@example.com', visible: true },
      phone: { countryIso: 'PT', nationalNumber: '000 000 000', visible: false },
    },
    socialLinks: [
      {
        id: 'social-github',
        kind: 'github',
        label: null,
        url: 'https://example.com/amina',
        visible: true,
      },
      {
        id: 'social-linkedin',
        kind: 'linkedin',
        label: null,
        url: 'https://example.com/in/amina',
        visible: true,
      },
      {
        id: 'social-behance',
        kind: 'behance',
        label: null,
        url: 'https://example.com/behance/amina',
        visible: false,
      },
    ],
    links: [
      {
        id: 'link-code',
        kind: 'code',
        label: 'Code',
        url: 'https://example.com/amina',
        visible: true,
      },
      {
        id: 'link-writing',
        kind: 'writing',
        label: 'Writing',
        url: 'https://example.com/amina/notes',
        visible: false,
      },
    ],
    experience: [
      {
        id: 'exp-1',
        organization: 'Northwind Payments',
        title: 'Senior Backend Engineer',
        location: 'Remote',
        startDate: '2023-03',
        endDate: null,
        current: true,
        summary: 'Ledger and settlement services for card payments.',
        highlights: [
          'Rebuilt settlement reconciliation as an idempotent job.',
          'Cut median payout latency by moving batching off the request path.',
        ],
        technologies: ['TypeScript', 'PostgreSQL', 'Kafka'],
      },
      {
        id: 'exp-2',
        organization: 'Harbour Analytics',
        title: 'Backend Engineer',
        location: 'Lisbon',
        startDate: '2020-06',
        endDate: '2023-02',
        current: false,
        summary: null,
        highlights: ['Owned the ingestion pipeline through a 10x traffic increase.'],
        technologies: ['Go', 'PostgreSQL'],
      },
    ],
    projects: [
      {
        id: 'proj-1',
        slug: 'ledger-replay',
        role: 'Author and maintainer',
        year: '2024-02',
        coverAssetId: null,
        featured: true,
        name: 'Ledger Replay',
        summary: 'A tool that replays a day of ledger events against a candidate build.',
        highlights: ['Caught two rounding regressions before release.'],
        technologies: ['TypeScript'],
        links: [
          {
            id: 'proj-1-link',
            kind: 'repository',
            label: 'Repository',
            url: 'https://example.com/ledger-replay',
            visible: true,
          },
        ],
        content: [
          {
            id: 'proj-1-intro',
            kind: 'paragraph',
            text: 'Replays a day of ledger events against a candidate build and diffs the resulting balances.',
          },
        ],
      },
      {
        id: 'proj-2',
        slug: null,
        role: null,
        year: null,
        coverAssetId: null,
        featured: false,
        name: 'Budget Alarm',
        summary: null,
        highlights: [],
        technologies: ['Go'],
        links: [],
        content: [],
      },
    ],
    skills: [
      { id: 'skills-1', label: 'Languages', tier: 'primary', items: ['TypeScript', 'Go', 'SQL'] },
      {
        id: 'skills-2',
        label: 'Infrastructure',
        tier: 'strong',
        items: ['PostgreSQL', 'Kafka', 'Terraform'],
      },
    ],
    softSkills: [
      {
        id: 'soft-1',
        label: 'Writing things down',
        detail: 'Wrote the reconciliation runbook the on-call rota still uses.',
      },
      { id: 'soft-2', label: 'Mentoring', detail: null },
    ],
    courses: [
      {
        id: 'course-1',
        name: 'Distributed Systems',
        provider: 'MIT OpenCourseWare',
        date: '2021-09',
        url: 'https://example.com/course/distributed-systems',
        summary: null,
      },
    ],
    publications: [
      {
        id: 'pub-1',
        title: 'Reconciling a ledger you did not design',
        publisher: 'Example Engineering Blog',
        date: '2024-05',
        url: 'https://example.com/writing/reconciliation',
        summary: null,
      },
    ],
    volunteering: [
      {
        id: 'vol-1',
        organization: 'Code Club Lisbon',
        role: 'Mentor',
        startDate: '2022-01',
        endDate: null,
        summary: 'Weekly sessions with secondary-school students.',
      },
    ],
    testimonials: [
      {
        id: 'testimonial-1',
        quote:
          'Amina found the rounding bug three releases before it would have reached a customer.',
        author: 'Rui Marques',
        role: 'Engineering Manager',
        organization: 'Northwind Payments',
      },
    ],
    interests: ['Long-distance running', 'Typography'],
    gallery: [
      {
        id: 'gallery-1',
        assetId: 'asset-gallery-1',
        alt: 'A whiteboard showing the settlement state machine',
        caption: 'The settlement state machine, before it was code',
      },
    ],
    attachments: [
      {
        id: 'attachment-cv',
        kind: 'cv',
        label: 'Curriculum vitae',
        assetId: 'asset-cv',
        fileName: 'amina-rahman-cv.pdf',
        contentType: 'application/pdf',
        sizeBytes: 184_320,
        visible: true,
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'University of Lisbon',
        degree: 'BSc',
        field: 'Computer Science',
        startDate: '2016-09',
        endDate: '2020-06',
        location: 'Lisbon',
        details: null,
      },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'Certified Kubernetes Administrator',
        issuer: 'CNCF',
        date: '2022-04',
        credentialUrl: 'https://example.com/credential/cka',
      },
    ],
    languages: [
      { id: 'lang-1', name: 'Portuguese', proficiency: 'Native' },
      { id: 'lang-2', name: 'English', proficiency: 'Fluent' },
    ],
    awards: [],
    pages: [
      {
        id: 'page-home',
        slug: '',
        title: 'Home',
        navLabel: 'Home',
        description: 'Backend engineer working on payment systems.',
        visible: true,
        visibility: 'public',
        passwordHash: null,
        order: 0,
        sections: [...HOME_SECTIONS],
      },
      PROJECTS_PAGE,
      {
        id: 'page-hidden',
        slug: 'notes',
        title: 'Notes',
        navLabel: 'Notes',
        description: null,
        visible: false,
        visibility: 'public',
        passwordHash: null,
        order: 20,
        sections: [],
      },
    ],
    theme: { templateId: DEFAULT_TEMPLATE_ID, mode: 'system', accent: 'default' },
    seo: { title: null, description: null, indexable: true },
    source: { kind: 'resume-import', resumeUploadId: 'upload-fixture' },
  };
}

/** A brand-new portfolio: valid, and almost entirely empty. */
export function buildMinimalPortfolioDocument(): PortfolioDocument {
  const document = createEmptyPortfolioDocument('Minimal Example');

  return {
    ...document,
    identity: { ...document.identity, headline: 'Available for work' },
  };
}

/**
 * Long, unicode and RTL content. A layout that only ever saw the full fixture
 * looks fine right up until someone's real job title is 90 characters long.
 */
export function buildLongContentPortfolioDocument(): PortfolioDocument {
  const document = buildFullPortfolioDocument();

  return {
    ...document,
    identity: {
      ...document.identity,
      displayName: 'Wolfeschlegelsteinhausenbergerdorff إيهاب Александрович',
      headline:
        'Principal Distributed Systems Engineer, Payments Platform Reliability and Settlement Correctness',
      summary: 'مهندس برمجيات يعمل على أنظمة الدفع.\n'.repeat(3).trim(),
      location: 'القاهرة، مصر',
    },
  };
}

/**
 * Look a fixture page up by slug.
 *
 * Index access would be `possibly undefined` under `noUncheckedIndexedAccess`,
 * and sprinkling non-null assertions through the suite trades a real guarantee
 * for terseness. Throwing names the problem when a fixture changes shape.
 */
export function pageBySlug(document: PortfolioDocument, slug: string): PortfolioPage {
  const page = document.pages.find((candidate) => candidate.slug === slug);

  if (page === undefined) {
    throw new Error(`Fixture has no page with slug "${slug}"`);
  }

  return page;
}
