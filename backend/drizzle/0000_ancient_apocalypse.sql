CREATE TYPE "public"."application_status" AS ENUM('wishlist', 'applied', 'interview', 'offer', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TABLE "application_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"job_url" text,
	"city" varchar(120),
	"country" varchar(120),
	"is_remote" boolean DEFAULT false NOT NULL,
	"status" "application_status" DEFAULT 'wishlist' NOT NULL,
	"applied_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;