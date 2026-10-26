import { eq } from "drizzle-orm";

import type { Database } from "../db/client.js";
import {
  applicationNotes,
  applications,
  legalAcceptances,
} from "../db/schema/index.js";

/**
 * Database access for account export and deletion.
 */
export class AccountRepository {
  constructor(private readonly db: Database) {}

  /**
   * Loads all applications for a user (export).
   */
  async listApplicationsForUser(userId: string) {
    return this.db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));
  }

  /**
   * Loads all notes for a user (export).
   */
  async listNotesForUser(userId: string) {
    return this.db
      .select()
      .from(applicationNotes)
      .where(eq(applicationNotes.userId, userId));
  }

  /**
   * Loads legal acceptance rows for a user (export).
   */
  async listLegalAcceptancesForUser(userId: string) {
    return this.db
      .select()
      .from(legalAcceptances)
      .where(eq(legalAcceptances.userId, userId));
  }

  /**
   * Deletes all app data owned by the user (notes cascade with applications).
   */
  async deleteUserData(userId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(applications)
        .where(eq(applications.userId, userId));
      await tx
        .delete(legalAcceptances)
        .where(eq(legalAcceptances.userId, userId));
    });
  }
}
