/**
 * The database projection `toAccountStatus` accepts.
 *
 * Declared structurally rather than relying on Prisma's generated enum type:
 * `@prisma/client` is confined to `src/packages/database/`, and widening the
 * enum field to plain `string` here is what makes the cast at the mapper
 * boundary meaningful rather than redundant — the same convention
 * `PortfolioRow` follows in
 * `src/modules/portfolios/types/portfolio-row.types.ts`.
 */
export interface UserAccountStatusRow {
  readonly status: string;
}
