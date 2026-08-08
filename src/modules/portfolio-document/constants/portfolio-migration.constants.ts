import type { DocumentMigrationStep } from '../types/portfolio-migration.types';

/**
 * The migration chain, in order.
 *
 * Empty because version 1 is the only version that has ever existed. It is
 * declared anyway — with the loop that consumes it already written and tested —
 * so that shipping version 2 is adding one entry, not designing a migration
 * mechanism under time pressure while published portfolios are failing to
 * render.
 */
export const DOCUMENT_MIGRATION_STEPS: readonly DocumentMigrationStep[] = [];
