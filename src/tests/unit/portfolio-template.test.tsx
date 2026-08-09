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
