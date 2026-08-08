/**
 * The columns every portfolio read selects.
 *
 * Explicit rather than `select: undefined`: the public read path must not
 * accidentally start carrying a column added later for authoring, and a
 * reviewer can see the whole surface without opening the schema.
 */
export const PORTFOLIO_SELECT = {
  id: true,
  ownerId: true,
  slug: true,
  status: true,
  templateId: true,
  draftDocument: true,
  draftVersion: true,
  publishedDocument: true,
  publishedVersion: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;
