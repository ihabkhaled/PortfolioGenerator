import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/**
 * Run a dependency's CLI without going through a shell.
 *
 * The obvious approach — executing `node_modules/.bin/<name>` — does not work
 * on Windows, where that path is a `.cmd` shim that `execFileSync` refuses to
 * spawn. The usual fix is `shell: true`, which reintroduces quoting rules for a
 * path that contains a space on most Windows checkouts.
 *
 * Resolving the package's own entry point and handing it to the running Node
 * binary avoids both problems, and fails with "not installed" rather than with
 * a spawn error when the dependency is absent — which is the distinction the
 * install scripts are built around.
 *
 * The manifest is read from `node_modules` directly rather than through
 * `require.resolve('<pkg>/package.json')`, because a package whose `exports`
 * field is a bare string — husky's is — does not expose its own manifest as a
 * subpath, and the resolver refuses. Reading the file is the thing that
 * actually works for every package.
 */

const REPOSITORY_ROOT = path.resolve(import.meta.dirname, '..');

export function resolvePackageBin(packageName, binName = packageName) {
  const manifestPath = path.join(REPOSITORY_ROOT, 'node_modules', packageName, 'package.json');

  if (!existsSync(manifestPath)) {
    return null;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const entry = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[binName];

  if (entry === undefined) {
    return null;
  }

  const binPath = path.join(path.dirname(manifestPath), entry);

  return existsSync(binPath) ? binPath : null;
}

/** Runs the CLI, inheriting stdio, and exits with its status if it fails. */
export function runPackageBin(binPath, args, cwd) {
  const result = spawnSync(process.execPath, [binPath, ...args], { cwd, stdio: 'inherit' });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
