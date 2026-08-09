-- CreateEnum
CREATE TYPE "asset_purpose" AS ENUM ('RESUME', 'PORTRAIT', 'GALLERY', 'CERTIFICATE', 'ATTACHMENT');

-- CreateEnum
CREATE TYPE "asset_visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "asset_scan_status" AS ENUM ('CLEAN');

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "purpose" "asset_purpose" NOT NULL,
    "visibility" "asset_visibility" NOT NULL DEFAULT 'PRIVATE',
    "scan_status" "asset_scan_status" NOT NULL DEFAULT 'CLEAN',
    "storage_key" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_storage_key_key" ON "assets"("storage_key");

-- CreateIndex
CREATE INDEX "assets_owner_id_portfolio_id_deleted_at_idx" ON "assets"("owner_id", "portfolio_id", "deleted_at");

-- CreateIndex
CREATE INDEX "assets_owner_id_sha256_idx" ON "assets"("owner_id", "sha256");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
