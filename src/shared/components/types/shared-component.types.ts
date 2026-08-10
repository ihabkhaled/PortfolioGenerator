import type { ReactNode } from 'react';

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
  readonly navigation: ReactNode;
  readonly navigationLabel: string;
  readonly footerNote: string;
  readonly footerLinks: ReactNode;
  readonly children: ReactNode;
}
