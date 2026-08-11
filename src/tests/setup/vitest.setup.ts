import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

if (typeof HTMLElement.prototype.scrollIntoView !== 'function') {
  HTMLElement.prototype.scrollIntoView = (): void => undefined;
}

/**
 * Unit tests run in jsdom against real modules wherever possible. Only the
 * genuinely un-runnable boundaries are stubbed: `server-only` (a build-time
 * marker with no test meaning) and the environment, which must be deterministic
 * so a developer's local `.env` cannot change an assertion.
 */

process.env.NEXT_PUBLIC_APP_URL = 'https://portfoliogenerate.test';
process.env.NEXT_PUBLIC_APP_ENV = 'local';

vi.mock('server-only', () => ({}));

/**
 * jsdom does not implement `matchMedia`, and anything that asks the browser
 * about a colour scheme calls it. A stub that reports "light" and accepts
 * listeners is the honest default: a test that cares about dark stubs it again
 * with the value it means.
 */
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
