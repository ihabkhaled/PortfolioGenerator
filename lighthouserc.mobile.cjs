'use strict';

const PORT = 3200;
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
        formFactor: 'mobile',
      },
    },
    assert: {
      aggregationMethod: 'median-run',
      assertions: {
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 1 }],
      },
    },
    upload: {
      outputDir: 'test-results/lighthouse/mobile',
      target: 'filesystem',
    },
  },
};
