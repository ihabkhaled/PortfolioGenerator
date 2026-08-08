import { buildFullPortfolioDocument } from '@/tests/fixtures/portfolio-document.fixtures';

/**
 * The seed reuses the test fixtures rather than defining a second synthetic
 * person. One source means the portfolio a developer sees locally is the same
 * one the suite asserts on, so "works on my machine" and "passes CI" describe
 * the same document.
 */

export const SEED_OWNER = {
  id: 'seed-owner',
  email: 'developer@example.com',
  name: 'Seed Developer',
} as const;

export const SEED_SLUG = 'amina-rahman';

export const SEED_DOCUMENT = buildFullPortfolioDocument();
