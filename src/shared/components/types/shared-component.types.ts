import type { ReactNode } from 'react';

import type { Route } from '@/packages/navigation';

export interface SkipLinkProps {
  readonly targetHref: string;
  readonly label: string;
}

export interface VisuallyHiddenProps {
  readonly children: ReactNode;
}

export interface PageHeaderProps {
  readonly title: string;
  readonly lead?: string;
  readonly actions?: ReactNode;
}

export interface SectionProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead?: string;
  readonly children: ReactNode;
  /** Rendered as the section's accessible name target. */
  readonly headingId: string;
}

export interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
}

export interface ErrorStateProps {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
  /** Renders a close control; omit for a panel the reader cannot dismiss. */
  readonly onDismiss?: () => void;
  readonly dismissLabel?: string;
}

export interface ManifestRow {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly mono?: boolean;
}

export interface ManifestPanelProps {
  readonly rows: readonly ManifestRow[];
  readonly ariaLabel: string;
}

export interface SiteShellProps {
  /** Reader-owned controls rendered beside the primary navigation. */
  readonly actions?: ReactNode;
  readonly brand: ReactNode;
  /** Plain product name, reused for the compact footer brand mark. */
  readonly brandName: string;
  /** Icon-only link back to `/`, rendered in both the header and the footer. */
  readonly homeLink: ReactNode;
  /** Accessible name for the mobile menu disclosure. */
  readonly menuLabel: string;
  readonly navigation: ReactNode;
  readonly navigationLabel: string;
  readonly footerNote: string;
  readonly footerLinks: ReactNode;
  readonly children: ReactNode;
}

export interface NavDisclosureProps {
  /** Accessible name for the closed toggle control. */
  readonly label: string;
  readonly children: ReactNode;
}

export interface SiteAuthNavProps {
  readonly isSignedIn: boolean;
  readonly dashboardHref: Route;
  readonly signInHref: Route;
  readonly signUpHref: Route;
  readonly dashboardLabel: string;
  readonly signInLabel: string;
  readonly signUpLabel: string;
}

export interface SiteFooterLinkItem {
  readonly id: string;
  readonly href: Route;
  readonly label: string;
}

export interface SiteFooterColumn {
  readonly id: string;
  readonly heading: string;
  readonly links: readonly SiteFooterLinkItem[];
}

export interface SiteFooterNavProps {
  readonly columns: readonly SiteFooterColumn[];
}
