import type { NextConfig } from 'next';

/**
 * Baseline security headers applied to every route. The Content-Security-Policy
 * is nonce-based and therefore lives in `src/proxy.ts`, where a fresh nonce is
 * generated per request.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

/**
 * Private uploads and every authenticated surface must never be cached by an
 * intermediary or indexed. Public portfolio routes opt in to caching explicitly
 * through their own cache tags.
 */
const noStoreHeaders = [
  { key: 'Cache-Control', value: 'no-store, max-age=0' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  turbopack: {},
  experimental: {
    // The editor posts whole draft documents; the default 1 MB action body
    // limit is below a large but legitimate portfolio.
    serverActions: { bodySizeLimit: '4mb' },
  },
  images: {
    // Portfolio portraits are served from our own storage route, never from a
    // user-supplied remote host: allowing arbitrary remote patterns would turn
    // the image optimizer into an SSRF proxy.
    remotePatterns: [],
  },
  headers() {
    return Promise.resolve([
      { source: '/(.*)', headers: securityHeaders },
      // Both forms are listed on purpose: `:path*` does not match the bare
      // segment, so `/dashboard/:path*` alone leaves the dashboard index — the
      // page every signed-in user actually lands on — without these headers.
      // The E2E suite asserts on `/dashboard` for exactly that reason.
      { source: '/dashboard', headers: noStoreHeaders },
      { source: '/dashboard/:path*', headers: noStoreHeaders },
      { source: '/api/uploads', headers: noStoreHeaders },
      { source: '/api/uploads/:path*', headers: noStoreHeaders },
    ]);
  },
};

export default nextConfig;
