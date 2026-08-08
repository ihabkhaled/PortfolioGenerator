import 'server-only';

/**
 * Owner of `next/og`.
 *
 * One import site for the satori-backed renderer. It is the heaviest thing in
 * the repository that runs per request — a WASM font shaper and a layout engine
 * — and keeping it behind a facade means the day it moves, changes name, or
 * needs a runtime pinned, exactly one file knows.
 *
 * Nothing else may import `next/og`; the package-boundary rule enforces it.
 */

export { ImageResponse } from 'next/og';
