import pg from 'pg';

/**
 * Creates the target database if it does not exist yet, then exits.
 *
 * `prisma migrate deploy` (used in production, via `vercel-build`) refuses on
 * purpose: a production database is provisioned by infrastructure, and the
 * application's own database user often lacks CREATEDB there. This script is
 * for local development only, where the opposite failure mode — a developer
 * points DATABASE_URL at a fresh Postgres server and every request dies with
 * "database does not exist" until they remember the one-off `createdb`
 * command — is the more common paper cut. Wired into `predev` so `npm run dev`
 * just works against any reachable Postgres server.
 *
 * Connects to Postgres's own always-present `postgres` maintenance database to
 * check for, and if needed create, the target database — the target database
 * obviously cannot be connected to before it exists.
 */

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // No URL configured yet is not this script's problem to report; the env
  // schema gives a much better message for that than a stack trace here would.
  process.exit(0);
}

const target = new URL(databaseUrl);
const databaseName = target.pathname.replace(/^\//u, '');

if (!databaseName) {
  process.exit(0);
}

const maintenanceUrl = new URL(target.href);
maintenanceUrl.pathname = '/postgres';

const client = new pg.Client({ connectionString: maintenanceUrl.href });

try {
  await client.connect();

  const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
    databaseName,
  ]);

  if (existing.rowCount === 0) {
    // CREATE DATABASE cannot take a bind parameter for its identifier — this
    // is the same shape as EXC-0001's storage-key case, escaped rather than
    // parameterized. See EXC-0008.
    await client.query(`CREATE DATABASE ${client.escapeIdentifier(databaseName)}`);
    console.log(`Created database "${databaseName}".`);
  }
} catch (error) {
  // A server that is not reachable yet, or a user without CREATEDB, is not
  // fatal here: `prisma migrate` runs next and produces its own, better,
  // error for either case. This script only ever helps; it never blocks.
  console.warn(`Skipped database auto-create: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  try {
    await client.end();
  } catch {
    // Already disconnected, or never connected — either way, nothing to do.
  }
}
