CREATE TABLE "legal_acceptances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"email" varchar(255) NOT NULL,
	"documents_version" varchar(32) NOT NULL,
	"accepted_terms" boolean NOT NULL,
	"accepted_privacy" boolean NOT NULL,
	"ip_address" varchar(64),
	"user_agent" text,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL
);
