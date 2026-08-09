'use strict';

const PORT = 3201;
const origin = `http://127.0.0.1:${PORT}`;

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: `npm run start -- --port ${PORT}`,
      startServerReadyPattern: 'Ready in',
      url: [`${origin}/`, `${origin}/guides/accessibility`],
      settings: {
        chromeFlags: '--headless --no-sandbox',
        preset: 'desktop',
      },
    },
    assert: {
      aggregationMethod: 'median-run',
      assertions: {
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 1 }],
      },
    },
    upload: {
      outputDir: 'test-results/lighthouse/desktop',
      target: 'filesystem',
    },
  },
};
