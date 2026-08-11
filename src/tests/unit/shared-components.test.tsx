import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppLink } from '@/packages/link';
import { ManifestPanel } from '@/shared/components/data-display/manifest-panel.component';
import { Section } from '@/shared/components/data-display/section.component';
import { EmptyState } from '@/shared/components/feedback/empty-state.component';
import { ErrorState } from '@/shared/components/feedback/error-state.component';
import { AccountMenu } from '@/shared/components/layout/account-menu.component';
import { SiteAuthNav } from '@/shared/components/layout/site-auth-nav.component';
import { SiteFooterNav } from '@/shared/components/layout/site-footer-nav.component';
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
        brandName="ProFolio"
        homeLink={<a href="#home">Home</a>}
        menuLabel="Menu"
        navigationLabel="Primary"
        navigation={<a href="#dashboard">Dashboard</a>}
        footerNote="Built for people who have a CV."
        footerLinks={<a href="#privacy">Privacy</a>}
      >
        <p>Page body</p>
      </SiteShell>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getAllByRole('navigation', { name: 'Primary' })).toHaveLength(2);
    expect(screen.getByRole('main')).toHaveTextContent('Page body');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Built for people who have a CV.');
  });

  it('renders the home link and brand name in the footer as well as the header', () => {
    render(
      <SiteShell
        brand={<span>ProFolio</span>}
        brandName="ProFolio"
        homeLink={<a href="#home">Home</a>}
        menuLabel="Menu"
        navigationLabel="Primary"
        navigation={<a href="#dashboard">Dashboard</a>}
        footerNote="Built for people who have a CV."
        footerLinks={<a href="#privacy">Privacy</a>}
      >
        <p>Page body</p>
      </SiteShell>,
    );

    expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(2);
    expect(within(screen.getByRole('contentinfo')).getByText('ProFolio')).toBeInTheDocument();
  });

  it('exposes a mobile menu toggle labelled for the reader', () => {
    render(
      <SiteShell
        brand={<span>ProFolio</span>}
        brandName="ProFolio"
        homeLink={<a href="#home">Home</a>}
        menuLabel="Menu"
        navigationLabel="Primary"
        navigation={<a href="#dashboard">Dashboard</a>}
        footerNote="Built for people who have a CV."
        footerLinks={<a href="#privacy">Privacy</a>}
      >
        <p>Page body</p>
      </SiteShell>,
    );

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByLabelText('Menu')).toBeInTheDocument();
  });

  it('keeps the authenticated account control outside the collapsible mobile menu', () => {
    render(
      <SiteShell
        account={<button type="button">Account</button>}
        brand={<span>ProFolio</span>}
        brandName="ProFolio"
        homeLink={<a href="#home">Home</a>}
        menuLabel="Menu"
        navigationLabel="Primary"
        navigation={<a href="#dashboard">Dashboard</a>}
        footerNote="Built for people who have a CV."
        footerLinks={<a href="#privacy">Privacy</a>}
      >
        <p>Page body</p>
      </SiteShell>,
    );

    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();
    const primaryNavigations = screen.getAllByRole('navigation', { name: 'Primary' });
    for (const navigation of primaryNavigations) {
      expect(within(navigation).queryByRole('button', { name: 'Account' })).not.toBeInTheDocument();
    }
  });
});

describe('SiteAuthNav', () => {
  it('offers a way back to the dashboard once signed in, and nothing else', () => {
    render(
      <SiteAuthNav
        isSignedIn
        dashboardHref="/dashboard"
        signInHref="/sign-in"
        signUpHref="/sign-up"
        dashboardLabel="Dashboard"
        signInLabel="Sign in"
        signUpLabel="Create account"
      />,
    );

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Create account' })).not.toBeInTheDocument();
  });

  it('offers sign-in and sign-up while signed out, and no dashboard link', () => {
    render(
      <SiteAuthNav
        isSignedIn={false}
        dashboardHref="/dashboard"
        signInHref="/sign-in"
        signUpHref="/sign-up"
        dashboardLabel="Dashboard"
        signInLabel="Sign in"
        signUpLabel="Create account"
      />,
    );

    expect(screen.getByRole('link', { name: /Sign in/ })).toHaveAttribute('href', '/sign-in');
    expect(screen.getByRole('link', { name: /Create account/ })).toHaveAttribute(
      'href',
      '/sign-up',
    );
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
  });
});

describe('AccountMenu', () => {
  it('shows the first name initial and exposes the authenticated destinations', () => {
    render(
      <AccountMenu
        name="Ihab Khaled"
        email="ihab@example.com"
        menuLabel="Account menu"
        dashboardHref="/dashboard"
        dashboardLabel="Dashboard"
        preferencesHref="/dashboard/settings"
        preferencesLabel="Preferences"
        logout={<button type="button">Log out</button>}
      />,
    );

    expect(screen.getByText('I')).toBeInTheDocument();
    const accountToggle = screen.getByRole('button', { name: 'Account menu' });
    expect(accountToggle).toBeInTheDocument();
    expect(within(accountToggle).getByTestId('account-menu-chevron')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Preferences' })).toHaveAttribute(
      'href',
      '/dashboard/settings',
    );
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('keeps mobile navigation content bounded and wrappable', () => {
    render(
      <SiteShell
        navigationLabel="Primary"
        brandName="ProFolio"
        homeLink={<AppLink href="/">Home</AppLink>}
        menuLabel="Menu"
        brand={<span>ProFolio</span>}
        navigation={<AppLink href="/guides">Turn a CV into a portfolio you control</AppLink>}
        actions={<button type="button">Theme</button>}
        footerNote="Private by design"
        footerLinks={<span>Footer links</span>}
      >
        <p>Page body</p>
      </SiteShell>,
    );

    const mobileMenu = screen.getAllByRole('navigation', { name: 'Primary' })[1];
    expect(mobileMenu).toHaveClass('min-w-0');
    expect(mobileMenu).toHaveClass('[&_a]:whitespace-normal');
  });

  it('falls back to the email initial when the account has no visible name', () => {
    render(
      <AccountMenu
        name="   "
        email="ada@example.com"
        menuLabel="Account menu"
        dashboardHref="/dashboard"
        dashboardLabel="Dashboard"
        preferencesHref="/dashboard/settings"
        preferencesLabel="Preferences"
        logout={<button type="button">Log out</button>}
      />,
    );

    expect(screen.getByText('A')).toBeInTheDocument();
  });
});

describe('SiteFooterNav', () => {
  it('renders each column as a labelled group of links', () => {
    render(
      <SiteFooterNav
        columns={[
          {
            id: 'product',
            heading: 'Product',
            links: [{ id: 'features', href: '/guides/features', label: 'Features' }],
          },
          {
            id: 'resources',
            heading: 'Resources',
            links: [{ id: 'feed', href: '/feed.xml', label: 'RSS feed' }],
          },
        ]}
      />,
    );

    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute(
      'href',
      '/guides/features',
    );
    expect(screen.getByRole('link', { name: 'RSS feed' })).toHaveAttribute('href', '/feed.xml');
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
