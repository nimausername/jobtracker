import { and, desc, eq } from "drizzle-orm";

import type { Database } from "../db/client.js";
import { applicationNotes, applications } from "../db/schema/index.js";

export type NoteRecord = typeof applicationNotes.$inferSelect;

/**
 * Database access for application timeline notes.
 */
export class NotesRepository {
  constructor(private readonly db: Database) {}

  /**
   * Ensures the application belongs to the user.
   */
  async ownsApplication(userId: string, applicationId: string): Promise<boolean> {
    const row = await this.db.query.applications.findFirst({
      where: and(
        eq(applications.id, applicationId),
        eq(applications.userId, userId),
      ),
      columns: { id: true },
    });

    return Boolean(row);
  }

  /**
   * Lists notes for an application, newest first.
   */
  async listForApplication(
    userId: string,
    applicationId: string,
  ): Promise<NoteRecord[]> {
    return this.db
      .select()
      .from(applicationNotes)
      .where(
        and(
          eq(applicationNotes.applicationId, applicationId),
          eq(applicationNotes.userId, userId),
        ),
      )
      .orderBy(desc(applicationNotes.createdAt));
  }

  /**
   * Creates a timeline note.
   */
  async create(
    userId: string,
    applicationId: string,
    body: string,
  ): Promise<NoteRecord> {
    const [row] = await this.db
      .insert(applicationNotes)
      .values({
        userId,
        applicationId,
        body,
      })
      .returning();

    if (!row) {
      throw new Error("Insert returned no row");
    }

    return row;
  }

  /**
   * Deletes a note owned by the user on the given application.
   */
  async delete(
    userId: string,
    applicationId: string,
    noteId: string,
  ): Promise<boolean> {
    const deleted = await this.db
      .delete(applicationNotes)
      .where(
        and(
          eq(applicationNotes.id, noteId),
          eq(applicationNotes.applicationId, applicationId),
          eq(applicationNotes.userId, userId),
        ),
      )
      .returning({ id: applicationNotes.id });

    return deleted.length > 0;
  }
}
