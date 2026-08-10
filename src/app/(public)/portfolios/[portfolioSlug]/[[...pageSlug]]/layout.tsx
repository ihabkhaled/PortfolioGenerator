import type { ReactElement, ReactNode } from 'react';

/**
 * A pass-through layout that exists to give the public portfolio route its own
 * segment boundary.
 *
 * That boundary is what the `no-authoring-imports-in-public-render` lint rule
 * keys on: everything under `src/app/(public)/` is anonymous-visitor code, and
 * nothing in it may import the AI provider, the ingestion pipeline, the editor
 * or object storage.
 */
export default function PublicPortfolioLayout(props: {
  readonly children: ReactNode;
}): ReactElement {
  return props.children as ReactElement;
}
