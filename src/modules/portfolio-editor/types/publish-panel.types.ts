export interface PublishPanelProps {
  readonly portfolioId: string;
  readonly slug: string;
  readonly isPublished: boolean;
  /** Absolute origin, so the URL preview shows the address people will paste. */
  readonly origin: string;
}
