import type { Route } from 'next';
import NextLink from 'next/link';
import type { ComponentProps, ReactElement } from 'react';

/**
 * Owner of `next/link`.
 *
 * Only internal navigation lives here. Links to URLs that came from a CV, a
 * model or a form go through `ExternalLink` in the shared design system, which
 * applies the URL safety policy — a package wrapper sits below the layer that
 * policy belongs to.
 */

export type AppLinkProps = ComponentProps<typeof NextLink>;

export function AppLink(props: Readonly<AppLinkProps>): ReactElement {
  return <NextLink {...props} />;
}

/**
 * Assert that a computed path is a real route.
 *
 * `typedRoutes` checks literal hrefs at compile time, which is exactly what
 * you want for static links and exactly what cannot work for
 * `/{slug}/{pageSlug}` — the values come from the database. This is the single
 * sanctioned place that assertion is made, so a reviewer can find every
 * dynamic href by looking for one function rather than grepping for casts.
 *
 * The safety argument is upstream: both segments are validated against the
 * slug shape policy before they are ever stored.
 *
 * Widened through `unknown` rather than asserted directly, because the two
 * compilers this repo runs disagree here: TypeScript 7 sees the branded
 * `Route` that `typedRoutes` generates, while the TypeScript 6 API that
 * typescript-eslint uses resolves it to `string` and reports a direct
 * assertion as unnecessary. The two-step keeps both gates honest.
 */
export function toAppRoute(path: string): Route {
  return path as unknown as Route;
}
