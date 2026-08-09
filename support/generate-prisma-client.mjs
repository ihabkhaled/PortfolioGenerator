import path from 'node:path';
import process from 'node:process';

import { resolvePackageBin, runPackageBin } from './run-package-bin.mjs';

/**
 * Generate the Prisma client, if the generator is installed.
 *
 * The client is generated code that nothing commits, so a checkout without it
 * produces a wall of implicit-`any` errors that read like a type problem and
 * are actually a missing build step. Running it on install means that cannot
 * happen to anyone.
 *
 * Skipped rather than failed when the CLI is absent: an install that omitted
 * devDependencies has nothing to generate with, and the build generates the
 * client itself before it compiles anything.
 */

const prisma = resolvePackageBin('prisma');

if (prisma === null) {
  console.log('[prisma] the CLI is not installed — the build will generate the client');
  process.exit(0);
}

runPackageBin(prisma, ['generate'], path.resolve(import.meta.dirname, '..'));
