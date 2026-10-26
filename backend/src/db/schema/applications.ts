import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Application pipeline statuses.
 */
export const applicationStatusEnum = pgEnum("application_status", [
  "wishlist",
  "applied",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
]);

/**
 * Job applications owned by a Keycloak user (`userId` = token `sub`).
 */
export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  jobTitle: varchar("job_title", { length: 255 }).notNull(),
  jobUrl: text("job_url"),
  city: varchar("city", { length: 120 }),
  country: varchar("country", { length: 120 }),
  isRemote: boolean("is_remote").notNull().default(false),
  status: applicationStatusEnum("status").notNull().default("wishlist"),
  appliedAt: timestamp("applied_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Timeline notes attached to an application.
 */
export const applicationNotes = pgTable("application_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 128 }).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
