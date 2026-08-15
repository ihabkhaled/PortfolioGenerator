import type { PoolConfig } from 'pg';

export type PostgresSslMode = 'disable' | 'verify-full';

interface PostgresConfigInput {
  readonly databaseUrl: string;
  readonly isVercel: boolean;
  readonly sslMode: PostgresSslMode;
}

/**
 * Keep pools short-lived on serverless instances. SSL is opt-in because local
 * development uses the repository's plain Docker/Postgres service; deployments
 * should choose `verify-full` when their provider supplies a trusted certificate.
 */
export function createPostgresPoolConfig(input: PostgresConfigInput): PoolConfig {
  const config: PoolConfig = {
    connectionString: withoutSslModeQuery(input.databaseUrl),
    max: input.isVercel ? 1 : 10,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  };

  if (input.sslMode !== 'disable') {
    config.ssl = { rejectUnauthorized: true };
  }

  return config;
}

/** The application setting must win over libpq-compatible URL query flags. */
function withoutSslModeQuery(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  url.searchParams.delete('sslmode');
  return url.href;
}
