CREATE TYPE "public"."work_arrangement" AS ENUM('onsite', 'hybrid', 'remote');--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "work_arrangement" "work_arrangement" DEFAULT 'onsite' NOT NULL;--> statement-breakpoint
UPDATE "applications" SET "work_arrangement" = 'remote' WHERE "is_remote" = true;--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "is_remote";
