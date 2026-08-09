ALTER TABLE "assets"
ADD COLUMN "object_deleted_at" TIMESTAMP(3),
ADD COLUMN "deletion_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "deletion_retry_at" TIMESTAMP(3);

CREATE INDEX "assets_deletion_retry_at_object_deleted_at_idx"
ON "assets"("deletion_retry_at", "object_deleted_at");
