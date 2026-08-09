CREATE TABLE "email_verification_token_claims" (
    "token_digest" TEXT NOT NULL,
    "lease_id" TEXT,
    "lease_expires_at" TIMESTAMP(3),
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_verification_token_claims_pkey" PRIMARY KEY ("token_digest")
);

CREATE INDEX "email_verification_token_claims_lease_expires_at_idx"
ON "email_verification_token_claims"("lease_expires_at");
