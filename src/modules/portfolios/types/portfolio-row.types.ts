/**
 * The database projection the mappers accept.
 *
 * Declared structurally rather than importing Prisma's generated model type:
 * it keeps the mapper unit-testable with plain object fixtures and makes the
 * exact set of columns the domain depends on visible in one place.
 */
export interface PortfolioRow {
  readonly id: string;
  readonly ownerId: string;
  readonly slug: string;
  readonly status: string;
  readonly templateId: string;
  readonly draftDocument: unknown;
  readonly draftVersion: number;
  readonly publishedDocument: unknown;
  readonly publishedVersion: number;
  readonly publishedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
