import 'dotenv/config';

import { defineConfig, env } from 'prisma/config';

/**
 * Prisma 7 moved the connection URL out of the schema file. Migrations and
 * Studio read it from here; the runtime client gets it from the validated
 * server environment via `src/packages/database`, so there is still exactly one
 * place the application reads configuration from.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node --experimental-strip-types support/seed.mts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
