import { formatIssues, parseSchema } from '@/packages/zod';

import { DOCUMENT_MIGRATION_STEPS } from '../constants/portfolio-migration.constants';
import { portfolioDocumentSchema } from '../schemas/portfolio-document.schema';
import type { PortfolioDocument } from '../types/portfolio-document.types';

/**
 * The only supported way to read a stored document.
 *
 * Published portfolios outlive schema versions. A visitor loading a portfolio
 * published under version 1 must keep getting a page after the schema moves to
 * version 2, so migration runs before validation and the renderer only ever
 * sees a current, validated document.
 */

export function readSchemaVersion(input: unknown): number | null {
  if (typeof input !== 'object' || input === null || !('schemaVersion' in input)) {
    return null;
  }

  const { schemaVersion } = input;

  return typeof schemaVersion === 'number' ? schemaVersion : null;
}

/**
 * Walk the migration chain from the document's own version to the current one.
 *
 * Input with no readable version, or a version newer than this build knows
 * about, is passed through untouched so that validation — not this function —
 * produces the error. One failure path is easier to reason about than two.
 */
export function upgradeToCurrentVersion(input: unknown): unknown {
  const startVersion = readSchemaVersion(input);

  if (startVersion === null) {
    return input;
  }

  let document = input;
  let version = startVersion;

  for (const step of DOCUMENT_MIGRATION_STEPS) {
    if (step.from !== version) {
      continue;
    }

    document = step.upgrade(document);
    version = step.to;
  }

  return document;
}

/** Migrate then validate. Throws with a readable path list on invalid input. */
export function migratePortfolioDocument(input: unknown): PortfolioDocument {
  const parsed = parseSchema(portfolioDocumentSchema, upgradeToCurrentVersion(input));

  if (!parsed.ok) {
    throw new Error(`Invalid portfolio document: ${formatIssues(parsed.issues)}`);
  }

  return parsed.value;
}

/**
 * Non-throwing variant for the public read path: one corrupt row must not turn
 * into a 500 for an anonymous visitor. The caller renders a 404 instead, and
 * the failure is visible in logs.
 */
export function tryMigratePortfolioDocument(input: unknown): PortfolioDocument | null {
  const parsed = parseSchema(portfolioDocumentSchema, upgradeToCurrentVersion(input));

  return parsed.ok ? parsed.value : null;
}
