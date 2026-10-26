import { notFound } from "../../lib/errors.js";
import type { NotesRepository } from "../../repositories/notes-repository.js";
import type { CreateNoteBody } from "../../schemas/notes.js";

const toPublic = (row: {
  id: string;
  applicationId: string;
  body: string;
  createdAt: Date;
}) => ({
  id: row.id,
  applicationId: row.applicationId,
  body: row.body,
  createdAt: row.createdAt.toISOString(),
});

/**
 * Timeline notes use-cases.
 */
export class NotesService {
  constructor(private readonly repository: NotesRepository) {}

  /**
   * Lists notes for an owned application.
   */
  async list(userId: string, applicationId: string) {
    const owns = await this.repository.ownsApplication(userId, applicationId);
    if (!owns) {
      throw notFound("Application not found");
    }

    const rows = await this.repository.listForApplication(userId, applicationId);
    return rows.map(toPublic);
  }

  /**
   * Adds a note to an owned application.
   */
  async create(userId: string, applicationId: string, input: CreateNoteBody) {
    const owns = await this.repository.ownsApplication(userId, applicationId);
    if (!owns) {
      throw notFound("Application not found");
    }

    const row = await this.repository.create(userId, applicationId, input.body);
    return toPublic(row);
  }

  /**
   * Deletes a note from an owned application.
   */
  async delete(userId: string, applicationId: string, noteId: string) {
    const owns = await this.repository.ownsApplication(userId, applicationId);
    if (!owns) {
      throw notFound("Application not found");
    }

    const deleted = await this.repository.delete(userId, applicationId, noteId);
    if (!deleted) {
      throw notFound("Note not found");
    }
  }
}
