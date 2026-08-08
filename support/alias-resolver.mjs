import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Node ESM resolve hook that lets maintenance scripts import application code.
 *
 * `node --experimental-strip-types` runs the repo's TypeScript directly, but it
 * resolves like Node, not like the bundler the app is built with. Two things
 * differ, and both are handled here:
 *
 *   1. the `@/` path alias from tsconfig, which Node knows nothing about;
 *   2. extensionless relative specifiers (`../constants/foo.constants`), which
 *      Node ESM rejects but every file in `src/` uses.
 *
 * Teaching the resolver these two rules is a smaller and more honest fix than
 * either duplicating the code a script needs or adding a bundler to run a
 * 40-line seed. Scope is deliberately narrow: only specifiers that land inside
 * this repo's `src/` are touched, so package resolution is untouched.
 */

const projectRoot = new URL('../', import.meta.url);
const SOURCE_MARKER = '/src/';
const CANDIDATE_SUFFIXES = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];

function isFile(url) {
  try {
    return statSync(fileURLToPath(url)).isFile();
  } catch {
    return false;
  }
}

function findProjectFile(baseUrl) {
  for (const suffix of CANDIDATE_SUFFIXES) {
    const candidate = new URL(`${baseUrl.pathname}${suffix}`, projectRoot);

    if (isFile(candidate)) {
      return candidate.href;
    }
  }

  return null;
}

function resolveProjectSpecifier(specifier, parentUrl) {
  if (specifier.startsWith('@/')) {
    return findProjectFile(new URL(`src/${specifier.slice(2)}`, projectRoot));
  }

  const isRelative = specifier.startsWith('./') || specifier.startsWith('../');

  if (isRelative && parentUrl?.includes(SOURCE_MARKER)) {
    return findProjectFile(new URL(specifier, parentUrl));
  }

  return null;
}

export function resolve(specifier, context, nextResolve) {
  const projectFile = resolveProjectSpecifier(specifier, context.parentURL);

  return nextResolve(projectFile ?? specifier, context);
}
