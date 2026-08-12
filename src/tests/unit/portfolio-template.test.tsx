import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  buildNavigation,
  findVisiblePage,
  type PortfolioDocument,
} from '@/modules/portfolio-document';
import { buildPortfolioLabels, PortfolioTemplate } from '@/modules/portfolio-renderer';
import { StructuredData } from '@/modules/seo';
import { PortfolioOgCard } from '@/modules/seo/server';

import {
  buildFullPortfolioDocument,
  buildLongContentPortfolioDocument,
  buildMinimalPortfolioDocument,
} from '../fixtures/portfolio-document.fixtures';

/**
 * The fixture matrix.
 *
 * One template serves every portfolio, so the interesting question is not
 * "does it render the fixture" but "does it survive the shapes real documents
 * take": a full CV, a nearly empty one, and one with a 90-character job title
 * in a script that reads right to left. Each of these has broken a layout that
 * only ever saw the happy case.
 */

const translate = (key: string): string => key;

function renderPage(document: PortfolioDocument, pageSlug = ''): void {
  const resolved = findVisiblePage(document, pageSlug);

  if (resolved === null) {
    throw new Error(`Fixture has no visible page at "${pageSlug}"`);
  }

  render(
    <PortfolioTemplate
      document={document}
      sections={resolved.sections}
      navigation={buildNavigation(document, 'amina-rahman', pageSlug)}
      labels={buildPortfolioLabels(translate)}
      portfolioSlug="amina-rahman"
      pageTitle={resolved.page.title}
      isPreview={false}
      actions={null}
      footerLinks={null}
    />,
  );
}

describe.each([
  ['a full portfolio', buildFullPortfolioDocument],
  ['a nearly empty portfolio', buildMinimalPortfolioDocument],
  ['long, unicode and RTL content', buildLongContentPortfolioDocument],
])('the template renders %s', (_label, build) => {
  it('leads with the name as the page heading', () => {
    const document = build();

    renderPage(document);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      document.identity.displayName,
    );
  });

  it('exposes one main landmark and a navigation landmark', () => {
    renderPage(build());

    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders no empty section band', () => {
    renderPage(build());

    const bandHeadings = screen.queryAllByRole('heading', { level: 2 });

    for (const heading of bandHeadings) {
      expect(heading.textContent.trim()).not.toBe('');
    }
  });
});

describe('the template on a full portfolio', () => {
  it('marks PDF and reader actions as one safe floating surface', () => {
    const document = buildFullPortfolioDocument();
    const resolved = findVisiblePage(document, '');
    if (resolved === null) throw new Error('Expected the overview page');

    const view = render(
      <PortfolioTemplate
        document={document}
        sections={resolved.sections}
        navigation={buildNavigation(document, 'amina-rahman', '')}
        labels={buildPortfolioLabels(translate)}
        portfolioSlug="amina-rahman"
        pageTitle={resolved.page.title}
        isPreview={false}
        actions={null}
        footerLinks={<button type="button">Download PDF and share</button>}
      />,
    );

    expect(
      view.container.querySelector('[data-fixed-surface="portfolio-actions"]'),
    ).toHaveTextContent('Download PDF and share');
    expect(
      view.container.querySelector('[data-fixed-surface="portfolio-actions"]'),
    ).toHaveAttribute('data-fixed-surface', 'portfolio-actions');
  });

  it('keeps section rhythm and typography compact in a narrow portfolio container', () => {
    renderPage(buildFullPortfolioDocument());

    const page = screen.getByTestId('portfolio-section-page');
    const sections = screen.getAllByRole('region');
    expect(sections.length).toBeGreaterThan(1);
    expect(page).toHaveClass(
      '@max-4xl/portfolio:[&>section]:py-10',
      '@max-4xl/portfolio:[&>section>p]:pt-0',
      '@max-4xl/portfolio:[&>section>div>h2]:text-2xl',
      '@max-4xl/portfolio:[&>section>div>div]:pt-6',
    );
    expect(screen.queryByTestId('portfolio-section-band')).not.toBeInTheDocument();
    expect(sections[0]).toHaveClass('first:border-t-0');
    expect(sections[1]).toHaveClass('border-t');
  });

  it('renders every reviewed v2 profile collection', () => {
    const document = buildFullPortfolioDocument();
    renderPage({
      ...document,
      awards: [
        {
          id: 'award-1',
          name: 'Reliability award',
          issuer: null,
          date: null,
          description: null,
        },
      ],
    });

    expect(screen.getByText('Writing things down')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Distributed Systems' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Reconciling a ledger you did not design' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Code Club Lisbon')).toBeInTheDocument();
    expect(screen.getByText('Reliability award')).toBeInTheDocument();
    expect(screen.getByText(/Amina found the rounding bug/)).toBeInTheDocument();
    expect(screen.getByText('Long-distance running')).toBeInTheDocument();
    const gallerySource = screen
      .getByRole('img', { name: 'A whiteboard showing the settlement state machine' })
      .getAttribute('src');
    expect(decodeURIComponent(gallerySource ?? '')).toContain('/media/asset-gallery-1');
    expect(screen.getByRole('link', { name: /Curriculum vitae/ })).toHaveAttribute(
      'href',
      '/media/asset-cv',
    );
  });

  it('renders accessible visible social profiles and omits hidden ones', () => {
    renderPage(buildFullPortfolioDocument());

    expect(screen.getAllByRole('link', { name: 'GitHub' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'LinkedIn' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Behance' })).not.toBeInTheDocument();
  });

  it('renders every supported social icon family with an accessible label', () => {
    const document = buildFullPortfolioDocument();
    const kinds = [
      'gitlab',
      'stackoverflow',
      'youtube',
      'tiktok',
      'instagram',
      'behance',
      'dribbble',
      'facebook',
      'x',
      'threads',
      'medium',
      'telegram',
      'whatsapp',
      'website',
    ] as const;

    renderPage({
      ...document,
      socialLinks: kinds.map((kind) => ({
        id: `social-${kind}`,
        kind,
        label: kind,
        url: `https://example.com/${kind}`,
        visible: true,
      })),
    });

    for (const kind of kinds) {
      expect(screen.getAllByRole('link', { name: kind }).length).toBeGreaterThan(0);
    }
  });

  it('keeps a band when only its v2 collection has content', () => {
    const document = buildFullPortfolioDocument();
    renderPage({
      ...document,
      identity: { ...document.identity, summary: null },
      experience: [],
      skills: [],
      certifications: [],
    });

    expect(screen.getByText('Writing things down')).toBeInTheDocument();
    expect(screen.getByText('Code Club Lisbon')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Distributed Systems' })).toBeInTheDocument();
  });

  it('renders the reviewed experience entries', () => {
    renderPage(buildFullPortfolioDocument());

    expect(screen.getByText('Northwind Payments')).toBeInTheDocument();
    expect(screen.getByText('Harbour Analytics')).toBeInTheDocument();
  });

  // Hidden links are a deliberate choice in the editor, not a display detail.
  it('omits a link the author hid', () => {
    renderPage(buildFullPortfolioDocument());

    expect(screen.queryByRole('link', { name: 'Writing' })).not.toBeInTheDocument();
  });

  it('omits a contact channel the author kept private', () => {
    renderPage(buildFullPortfolioDocument());

    expect(screen.queryByText('+351 000 000 000')).not.toBeInTheDocument();
    expect(screen.getAllByText('amina@example.com').length).toBeGreaterThan(0);
  });

  it('keeps a hidden page out of the navigation', () => {
    renderPage(buildFullPortfolioDocument());

    const navigation = screen.getByRole('navigation');

    expect(within(navigation).queryByRole('link', { name: 'Notes' })).not.toBeInTheDocument();
    expect(within(navigation).getByRole('link', { name: 'Projects' })).toBeInTheDocument();
  });

  it('marks the current page for assistive technology', () => {
    renderPage(buildFullPortfolioDocument(), 'projects');

    const current = within(screen.getByRole('navigation')).getByRole('link', { name: 'Projects' });

    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('renders a subpage from its own section list', () => {
    renderPage(buildFullPortfolioDocument(), 'projects');

    expect(screen.getByRole('heading', { name: 'Selected work' })).toBeInTheDocument();
    expect(screen.getByText('Shipped')).toBeInTheDocument();
  });
});

describe('the template on a nearly empty portfolio', () => {
  it('renders a hero and nothing that would be blank', () => {
    renderPage(buildMinimalPortfolioDocument());

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Minimal Example');
    expect(screen.queryByText('Northwind Payments')).not.toBeInTheDocument();
  });

  it('has no navigation entry beyond the single page', () => {
    renderPage(buildMinimalPortfolioDocument());

    expect(within(screen.getByRole('navigation')).getAllByRole('link')).toHaveLength(1);
  });
});

describe('PortfolioOgCard', () => {
  it('renders the name, headline and address', () => {
    render(
      <PortfolioOgCard
        name="Amina Rahman"
        headline="Backend engineer"
        url="portfoliogenerate.test/amina-rahman"
      />,
    );

    expect(screen.getByText('Amina Rahman')).toBeInTheDocument();
    expect(screen.getByText('Backend engineer')).toBeInTheDocument();
    expect(screen.getByText('portfoliogenerate.test/amina-rahman')).toBeInTheDocument();
  });

  it('omits the headline line entirely when there is none', () => {
    render(<PortfolioOgCard name="Amina Rahman" headline={null} url="example.test/amina" />);

    expect(screen.getByText('Amina Rahman')).toBeInTheDocument();
    expect(screen.queryByText('Backend engineer')).not.toBeInTheDocument();
  });
});

describe('StructuredData', () => {
  it('writes the payload into the script body without escaping it', () => {
    const { container } = render(<StructuredData json={'{"@type":"Person"}'} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script?.textContent).toBe('{"@type":"Person"}');
  });
});
