import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

/**
 * Unit tests run in jsdom against real modules wherever possible. Only the
 * genuinely un-runnable boundaries are stubbed: `server-only` (a build-time
 * marker with no test meaning) and the environment, which must be deterministic
 * so a developer's local `.env` cannot change an assertion.
 */

process.env.NEXT_PUBLIC_APP_URL = 'https://portfoliogenerate.test';
process.env.NEXT_PUBLIC_APP_ENV = 'local';

vi.mock('server-only', () => ({}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
