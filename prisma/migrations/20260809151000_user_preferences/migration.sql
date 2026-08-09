ALTER TABLE "users"
ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN "theme_preference" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN "default_country_iso" TEXT;
