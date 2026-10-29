import { and, desc, eq } from "drizzle-orm";

import type { Database } from "../db/client.js";
import { applicationNotes, applications } from "../db/schema/index.js";
import type { CreateActivityInput } from "../schemas/notes.js";

export type NoteRecord = typeof applicationNotes.$inferSelect;

/**
 * Database access for application timeline activities.
 */
export class NotesRepository {
  constructor(private readonly db: Database) {}

  /**
   * Ensures the application belongs to the user.
   */
  async ownsApplication(userId: string, applicationId: string): Promise<boolean> {
    const row = await this.findApplicationForUser(userId, applicationId);
    return Boolean(row);
  }

  /**
   * Loads application fields needed to seed timeline milestones.
   */
  async findApplicationForUser(
    userId: string,
    applicationId: string,
  ): Promise<
    | {
        readonly id: string;
        readonly status:
          | "wishlist"
          | "applied"
          | "interview"
          | "offer"
          | "rejected"
          | "withdrawn";
        readonly appliedAt: Date | null;
        readonly createdAt: Date;
      }
    | undefined
  > {
    return this.db.query.applications.findFirst({
      where: and(
        eq(applications.id, applicationId),
        eq(applications.userId, userId),
      ),
      columns: {
        id: true,
        status: true,
        appliedAt: true,
        createdAt: true,
      },
    });
  }

  /**
   * Lists activities for an application, newest first.
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
   * Creates a timeline activity.
   */
  async create(
    userId: string,
    applicationId: string,
    input: CreateActivityInput,
  ): Promise<NoteRecord> {
    const [row] = await this.db
      .insert(applicationNotes)
      .values({
        userId,
        applicationId,
        kind: input.kind,
        body: input.body,
        fromStatus: input.fromStatus ?? null,
        toStatus: input.toStatus ?? null,
      })
      .returning();

    if (!row) {
      throw new Error("Insert returned no row");
    }

    return row;
  }

  /**
   * Updates a user note body (system activities cannot be updated).
   */
  async updateNoteBody(
    userId: string,
    applicationId: string,
    noteId: string,
    body: string,
  ): Promise<NoteRecord | undefined> {
    const [row] = await this.db
      .update(applicationNotes)
      .set({ body })
      .where(
        and(
          eq(applicationNotes.id, noteId),
          eq(applicationNotes.applicationId, applicationId),
          eq(applicationNotes.userId, userId),
          eq(applicationNotes.kind, "note"),
        ),
      )
      .returning();

    return row;
  }

  /**
   * Deletes a user note (system activities are not deleted here).
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
          eq(applicationNotes.kind, "note"),
        ),
      )
      .returning({ id: applicationNotes.id });

    return deleted.length > 0;
  }
}
