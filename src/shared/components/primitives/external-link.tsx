import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { isSafeExternalUrl } from '@/shared/utils/safe-url.util';

export interface ExternalLinkProps extends Omit<
  ComponentProps<'a'>,
  'href' | 'rel' | 'target' | 'children'
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

  if (!isSafeExternalUrl(href)) {
    return fallback;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" {...rest}>
      {children}
    </a>
  );
}
