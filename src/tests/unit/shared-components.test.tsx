import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ManifestPanel } from '@/shared/components/data-display/manifest-panel.component';
import { Section } from '@/shared/components/data-display/section.component';
import { EmptyState } from '@/shared/components/feedback/empty-state.component';
import { ErrorState } from '@/shared/components/feedback/error-state.component';
import { SiteShell } from '@/shared/components/layout/site-shell.component';
import { ExternalLink } from '@/shared/components/primitives/external-link';
import { SkipLink } from '@/shared/components/primitives/skip-link.component';
import { VisuallyHidden } from '@/shared/components/primitives/visually-hidden.component';

describe('ExternalLink', () => {
  it('renders a safe URL with the hardened rel attribute', () => {
    render(<ExternalLink href="https://example.com/amina">Code</ExternalLink>);

    const link = screen.getByRole('link', { name: 'Code' });

    expect(link).toHaveAttribute('href', 'https://example.com/amina');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer nofollow');
    expect(link).toHaveAttribute('target', '_blank');
  });

  // Refusing to emit the anchor is the one behaviour a cleverly-encoded
  // payload cannot work around.
  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'not a url at all',
  ])('renders nothing at all for %s', (href) => {
    const { container } = render(<ExternalLink href={href}>Code</ExternalLink>);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the caller fallback when the URL is refused', () => {
    render(
      <ExternalLink href="javascript:alert(1)" fallback={<span>Link removed</span>}>
        Code
      </ExternalLink>,
    );

    expect(screen.getByText('Link removed')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('feedback states', () => {
  it('renders an empty state with an optional action', () => {
    render(
      <EmptyState
        title="No portfolios yet"
        description="Create one to begin."
        action={<button type="button">Create</button>}
      />,
    );

    expect(screen.getByText('No portfolios yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('renders an empty state without an action', () => {
    render(<EmptyState title="Nothing here" description="Yet." />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  // An error a user needs to act on has to interrupt, not wait to be found.
  it('announces an error state', () => {
    render(<ErrorState title="Import failed" description="Try again." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Import failed');
  });

  it('renders an error state action when one is given', () => {
    render(
      <ErrorState
        title="Import failed"
        description="Try again."
        action={<button type="button">Retry</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});

describe('SiteShell', () => {
  it('exposes header, navigation, main and footer landmarks', () => {
    render(
      <SiteShell
        brand={<span>ProFolio</span>}
        navigationLabel="Primary"
        navigation={<a href="#dashboard">Dashboard</a>}
        footerNote="Built for people who have a CV."
        footerLinks={<a href="#privacy">Privacy</a>}
      >
        <p>Page body</p>
      </SiteShell>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Page body');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Built for people who have a CV.');
  });
});

describe('SkipLink', () => {
  it('points at the main content landmark', () => {
    render(<SkipLink targetHref="#main-content" label="Skip to content" />);

    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
      'href',
      '#main-content',
    );
  });
});

describe('VisuallyHidden', () => {
  it('keeps its content in the accessibility tree', () => {
    render(<VisuallyHidden>Opens in a new tab</VisuallyHidden>);

    expect(screen.getByText('Opens in a new tab')).toBeInTheDocument();
  });
});

describe('ManifestPanel', () => {
  it('renders label and value pairs as a definition list', () => {
    render(
      <ManifestPanel
        ariaLabel="Details"
        rows={[
          { id: 'location', label: 'Location', value: 'Lisbon' },
          { id: 'stack', label: 'Stack', value: 'TypeScript', mono: true },
        ]}
      />,
    );

    const list = screen.getByLabelText('Details');

    expect(within(list).getByText('Location')).toBeInTheDocument();
    expect(within(list).getByText('Lisbon')).toBeInTheDocument();
    expect(within(list).getByText('TypeScript')).toBeInTheDocument();
  });
});

describe('Section', () => {
  it('labels the band by its own heading', () => {
    render(
      <Section headingId="section-experience" eyebrow="01" title="Experience">
        <p>Roles</p>
      </Section>,
    );

    expect(screen.getByRole('region', { name: 'Experience' })).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
  });

  it('renders an optional lead paragraph', () => {
    render(
      <Section headingId="section-about" eyebrow="02" title="About" lead="A short introduction.">
        <p>Body</p>
      </Section>,
    );

    expect(screen.getByText('A short introduction.')).toBeInTheDocument();
  });
});
