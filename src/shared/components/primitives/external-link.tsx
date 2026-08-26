import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { normalizeSafeUrl } from '@/shared/utils/safe-url.util';

export interface ExternalLinkProps extends Omit<
  ComponentProps<'a'>,
  'href' | 'rel' | 'target' | 'children' | 'dangerouslySetInnerHTML'
> {
  readonly href: string;
  readonly children: ReactNode;
  /** Rendered instead of an anchor when the URL fails the safety check. */
  readonly fallback?: ReactElement | null;
}

/**
 * The only way a portfolio renders a URL it did not author.
 *
 * A URL that fails the safety policy is not rendered as a link at all — not
 * escaped, not stripped of its scheme, not shown with a warning. Refusing to
 * emit the anchor is the one behavior that cannot be worked around by a
 * cleverly-encoded `javascript:` payload.
 */
export function ExternalLink(props: Readonly<ExternalLinkProps>): ReactElement | null {
  const { href, children, fallback = null, ...rest } = props;

  // The anchor carries the canonical form the policy returned, never the raw
  // input: the rendered value is the sanitizer's own output.
  const safeHref = normalizeSafeUrl(href);

  if (safeHref === null) {
    return fallback;
  }

  return (
    <a href={safeHref} target="_blank" rel="noopener noreferrer nofollow" {...rest}>
      {children}
    </a>
  );
}
