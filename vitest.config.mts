import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const srcDir = path.resolve(import.meta.dirname, 'src');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.join(srcDir, 'app'),
      '@modules': path.join(srcDir, 'modules'),
      '@shared': path.join(srcDir, 'shared'),
      '@packages': path.join(srcDir, 'packages'),
      '@tests': path.join(srcDir, 'tests'),
      '@': srcDir,
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    maxWorkers: 4,
    setupFiles: ['./src/tests/setup/vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'src/tests/e2e/**', 'src/tests/accessibility/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/modules/**', 'src/shared/**', 'src/packages/**'],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/test/**',
        '**/types/**',
        '**/*.types.ts',
        '**/index.ts',
        // Vendor facades that only re-export or construct a client: exercised
        // by integration/E2E runs against a real database and a real browser,
        // not meaningfully unit-testable in jsdom.
        'src/packages/database/**',
        'src/packages/auth/**',
        'src/packages/ai/client.ts',
        'src/packages/pdf/**',
        'src/packages/i18n/request.ts',
        'src/shared/fonts/**',
      ],
      thresholds: {
        lines: 95,
        statements: 95,
        functions: 95,
        branches: 95,
        'src/**/{utils,helpers,mappers,schemas,policies}/**/*.ts': {
          lines: 100,
          statements: 100,
          functions: 100,
          branches: 100,
        },
      },
    },
  },
});
