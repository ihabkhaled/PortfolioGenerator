import { afterEach, describe, expect, it, vi } from 'vitest';

import { getFileScanner, setFileScanner } from '../services/file-scan.service';

const environment = vi.hoisted(() => ({
  CLAMAV_ENABLED: false,
  NODE_ENV: 'production',
}));

vi.mock('@/packages/env/server', () => ({
  getServerEnv: () => environment,
}));

describe('getFileScanner', () => {
  afterEach(() => {
    setFileScanner(null);
  });

  it('skips scanning when a production deployment explicitly disables ClamAV', async () => {
    const result = await getFileScanner().scan(new Uint8Array([1]));

    expect(result).toEqual({
      outcome: 'skipped',
      signature: null,
      detail: 'scanner-disabled',
    });
  });
});
