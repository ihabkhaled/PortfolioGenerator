import { describe, expect, it } from 'vitest';

import { createPostgresPoolConfig } from './postgres-config';

describe('createPostgresPoolConfig', () => {
  it('uses a bounded serverless pool and no SSL override locally', () => {
    expect(
      createPostgresPoolConfig({
        databaseUrl: 'postgresql://user:pass@localhost:5432/app',
        isVercel: true,
        sslMode: 'disable',
      }),
    ).toEqual({
      connectionString: 'postgresql://user:pass@localhost:5432/app',
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  });

  it('requires certificate verification and wins over URL sslmode flags', () => {
    expect(
      createPostgresPoolConfig({
        databaseUrl: 'postgresql://user:pass@db.example/app?sslmode=disable',
        isVercel: false,
        sslMode: 'verify-full',
      }).ssl,
    ).toEqual({ rejectUnauthorized: true });
  });

  it('removes a conflicting sslmode=require flag when SSL is disabled', () => {
    expect(
      createPostgresPoolConfig({
        databaseUrl: 'postgresql://user:pass@localhost/app?sslmode=require',
        isVercel: false,
        sslMode: 'disable',
      }).connectionString,
    ).not.toContain('sslmode');
  });
});
