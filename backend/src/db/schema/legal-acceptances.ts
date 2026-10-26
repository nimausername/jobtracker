import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * Record of a user accepting Terms and Privacy at registration.
 */
export const legalAcceptances = pgTable("legal_acceptances", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  documentsVersion: varchar("documents_version", { length: 32 }).notNull(),
  acceptedTerms: boolean("accepted_terms").notNull(),
  acceptedPrivacy: boolean("accepted_privacy").notNull(),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  acceptedAt: timestamp("accepted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
