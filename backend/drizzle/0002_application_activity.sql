CREATE TYPE "public"."application_activity_kind" AS ENUM('created', 'status_change', 'note');--> statement-breakpoint
ALTER TABLE "application_notes" ADD COLUMN "kind" "application_activity_kind" DEFAULT 'note' NOT NULL;--> statement-breakpoint
ALTER TABLE "application_notes" ADD COLUMN "from_status" "application_status";--> statement-breakpoint
ALTER TABLE "application_notes" ADD COLUMN "to_status" "application_status";
