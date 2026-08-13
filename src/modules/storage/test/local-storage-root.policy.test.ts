import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { getVercelLocalStorageRoot } from '../policies/local-storage-root.policy';

describe('getVercelLocalStorageRoot', () => {
  it('uses Vercel writable temporary storage for the local driver', () => {
    expect(getVercelLocalStorageRoot()).toBe(path.join(tmpdir(), '.storage'));
  });
});
