-- `published_version` was nullable, and `increment` on a NULL column yields
-- NULL in SQL. The first publish of every portfolio therefore left the counter
-- null, and the read path — which treats a null version as "not really
-- published" — turned a freshly published page into a 404 while the dashboard
-- said "Published".
--
-- Zero now means "never published", so incrementing counts from a real number.
-- Backfill first, then constrain: the order matters, because the ALTER would
-- fail on the rows this bug already produced.

UPDATE "portfolios" SET "published_version" = 0 WHERE "published_version" IS NULL;

ALTER TABLE "portfolios"
  ALTER COLUMN "published_version" SET DEFAULT 0,
  ALTER COLUMN "published_version" SET NOT NULL;

-- Rows published before the fix have a null version *and* a real snapshot.
-- They are genuinely published, so give them version 1 rather than leaving
-- them at the "never published" value.
UPDATE "portfolios"
SET "published_version" = 1
WHERE "status" = 'PUBLISHED' AND "published_document" IS NOT NULL AND "published_version" = 0;
