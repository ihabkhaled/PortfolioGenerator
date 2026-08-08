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
      /*
       * What this suite is responsible for.
       *
       * The excluded layers are not untested — they are tested by the E2E and
       * accessibility suites, against a real Postgres, a real object store and
       * a real browser. Chasing them here would mean mocking the database and
       * the framework, which produces a number that goes up while the
       * assertions describe a system that does not exist.
       *
       * The layers that remain are the ones where a unit test is the *better*
       * test: pure logic, and components rendered against real fixtures.
       */
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/test/**',
        '**/types/**',
        '**/*.types.ts',
        // Declarations, not behaviour: class-name bundles, limits, registries.
        // Importing them in a test to move a percentage would assert nothing.
        '**/constants/**',
        '**/*.constants.ts',
        '**/*.variants.ts',
        // Barrels and surface files re-export; there is nothing to execute.
        '**/index.ts',
        '**/index.tsx',
        'src/modules/*/server.ts',
        'src/modules/*/client.ts',
        'src/modules/*/dashboard.ts',
        'src/modules/*/*-ui.ts',
        // Authorization boundaries and data access: every one of these needs a
        // session and a database to mean anything, and the E2E suite gives
        // them both.
        '**/actions/**',
        '**/repositories/**',
        '**/providers/**',
        '**/services/**',
        // Vendor facades that only re-export or construct a client.
        'src/packages/database/**',
        'src/packages/auth/**',
        'src/packages/ai/client.ts',
        'src/packages/og/**',
        'src/packages/pdf/**',
        'src/packages/i18n/request.ts',
        'src/shared/fonts/**',
      ],
      thresholds: {
        lines: 95,
        statements: 95,
        functions: 95,
        branches: 95,
        /*
         * Pure logic is held at 100%. It is the layer where a missing test is
         * a missing decision — and the layer where a test is cheap, so there
         * is no excuse. Branches that `noUncheckedIndexedAccess` forces the
         * compiler to demand and an invariant makes unreachable are marked
         * with `v8 ignore` and a reason, so this number stays meaningful.
         */
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
