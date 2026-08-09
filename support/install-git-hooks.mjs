import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { resolvePackageBin, runPackageBin } from './run-package-bin.mjs';

/**
 * Install the git hooks, but only where there are git hooks to install.
 *
 * `npm ci` runs `prepare` on every install, including on a build machine that
 * has no `.git` directory — and, when the platform installs without
 * devDependencies, no husky either. Letting that fail breaks a deploy on a step
 * that could not have done anything useful in the first place: a build
 * container has no working copy, so nobody is ever going to commit from it.
 *
 * The test is "is this a developer checkout", not "is this CI". Keying off
 * `CI`, `VERCEL` or any other provider's variable means each new provider needs
 * a new name added here, and the failure mode is a broken deploy that nobody
 * can reproduce locally.
 *
 * A developer whose hooks genuinely fail to install still sees the error: both
 * conditions below are true in a real checkout.
 */

const repositoryRoot = path.resolve(import.meta.dirname, '..');

if (!existsSync(path.join(repositoryRoot, '.git'))) {
  console.log('[hooks] no .git directory — skipping hook installation');
  process.exit(0);
}

const husky = resolvePackageBin('husky');

if (husky === null) {
  console.log('[hooks] husky is not installed — skipping hook installation');
  process.exit(0);
}

runPackageBin(husky, [], repositoryRoot);
