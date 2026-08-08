/**
 * A no-op stand-in for the `server-only` package.
 *
 * That package exists to make a bundler fail when server code is pulled into a
 * client bundle. Run directly by Node there is no bundler and no client
 * bundle — only server code — so its default export throws for a condition
 * that cannot occur. Scripts resolve to this instead, and the real guarantee
 * is unaffected: `next build` still uses the real package.
 */
export {};
