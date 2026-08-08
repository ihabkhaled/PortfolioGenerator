export interface StructuredDataProps {
  /** Must come from `serializeStructuredData`; see the component's docs. */
  readonly json: string;
}

/** React's escape hatch, named so the one place that produces it is typed. */
export interface DangerousMarkup {
  readonly __html: string;
}
