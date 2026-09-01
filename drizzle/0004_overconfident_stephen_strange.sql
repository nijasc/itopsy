CREATE TYPE "public"."language" AS ENUM('en', 'de');--> statement-breakpoint
ALTER TABLE "studies" ADD COLUMN "language" "language" DEFAULT 'en' NOT NULL;--> statement-breakpoint
CREATE INDEX "studies_language_idx" ON "studies" USING btree ("language");