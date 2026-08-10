import 'server-only';

import IORedis from 'ioredis';

/**
 * Owner of `ioredis`.
 *
 * The narrow contract below — get/set/delete with a TTL, string or binary —
 * is all the PDF cache and the download-token store need. Callers depend on
 * `RedisClient`, never on `ioredis` directly, so the vendor stays a one-file
 * change and a test can hand either module a plain object that satisfies the
 * same four methods.
 *
 * Connection errors are logged by ioredis itself and retried with its default
 * backoff; nothing here throws on a transient disconnect; a call made while
 * the socket is down simply rejects, and every caller in this product treats
 * that rejection as "the cache is unavailable right now" rather than a fatal
 * error — see `portfolio-pdf`'s Redis-backed providers.
 */

export interface RedisClient {
  get: (key: string) => Promise<string | null>;
  getBuffer: (key: string) => Promise<Buffer | null>;
  setWithTtl: (key: string, value: string | Buffer, ttlSeconds: number) => Promise<void>;
  delete: (...keys: readonly string[]) => Promise<void>;
}

export function createRedisClient(url: string): RedisClient {
  // lazyConnect: the client is created once at module-registry time (see
  // portfolio-pdf's service registry) and may never be used on a given
  // request; connecting eagerly would spend a round trip on every cold start
  // for a feature a visitor might never touch.
  const client = new IORedis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });

  return {
    async get(key) {
      return client.get(key);
    },
    async getBuffer(key) {
      return client.getBuffer(key);
    },
    async setWithTtl(key, value, ttlSeconds) {
      await client.set(key, value, 'EX', ttlSeconds);
    },
    async delete(...keys) {
      if (keys.length === 0) return;
      await client.del(...keys);
    },
  };
}
