import { notFound } from "../../lib/errors.js";
import type { NotesRepository } from "../../repositories/notes-repository.js";
import type { ApplicationStatus } from "../../schemas/applications.js";
import type {
  CreateActivityInput,
  CreateNoteBody,
} from "../../schemas/notes.js";

type PublicActivity = {
  readonly id: string;
  readonly applicationId: string;
  readonly kind: "created" | "status_change" | "note";
  readonly body: string;
  readonly fromStatus: ApplicationStatus | null;
  readonly toStatus: ApplicationStatus | null;
  readonly createdAt: string;
  readonly deletable: boolean;
};

const toPublic = (row: {
  id: string;
  applicationId: string;
  kind: "created" | "status_change" | "note";
  body: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus | null;
  createdAt: Date;
}): PublicActivity => ({
  id: row.id,
  applicationId: row.applicationId,
  kind: row.kind,
  body: row.body,
  fromStatus: row.fromStatus,
  toStatus: row.toStatus,
  createdAt: row.createdAt.toISOString(),
  deletable: row.kind === "note",
});

/**
 * Timeline activity use-cases.
 */
export class NotesService {
  constructor(private readonly repository: NotesRepository) {}

  /**
   * Lists activities for an owned application.
   * Seeds missing created / applied milestones for older applications.
   */
  async list(userId: string, applicationId: string) {
    const application = await this.repository.findApplicationForUser(
      userId,
      applicationId,
    );
    if (!application) {
      throw notFound("Application not found");
    }

    const rows = await this.repository.listForApplication(userId, applicationId);
    const activities: PublicActivity[] = rows.map(toPublic);

    const hasCreated = activities.some((item) => item.kind === "created");
    if (!hasCreated) {
      activities.push({
        id: `synthetic-created-${application.id}`,
        applicationId: application.id,
        kind: "created",
        body: "Added to tracker",
        fromStatus: null,
        toStatus: null,
        createdAt: application.createdAt.toISOString(),
        deletable: false,
      });
    }

    const hasAppliedMilestone =
      activities.some(
        (item) =>
          item.kind === "status_change" && item.toStatus === "applied",
      ) ||
      activities.some(
        (item) => item.kind === "created" && item.toStatus === "applied",
      );

    if (application.appliedAt && !hasAppliedMilestone) {
      activities.push({
        id: `synthetic-applied-${application.id}`,
        applicationId: application.id,
        kind: "status_change",
        body: "Marked as applied",
        fromStatus: null,
        toStatus: "applied",
        createdAt: application.appliedAt.toISOString(),
        deletable: false,
      });
    }

    return activities.sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );
  }

  /**
   * Adds a user note to an owned application.
   */
  async create(userId: string, applicationId: string, input: CreateNoteBody) {
    const owns = await this.repository.ownsApplication(userId, applicationId);
    if (!owns) {
      throw notFound("Application not found");
    }

    const row = await this.repository.create(userId, applicationId, {
      kind: "note",
      body: input.body,
    });
    return toPublic(row);
  }

  /**
   * Records a system activity (created / status change). Used by other services.
   */
  async recordActivity(
    userId: string,
    applicationId: string,
    input: CreateActivityInput,
  ) {
    const row = await this.repository.create(userId, applicationId, input);
    return toPublic(row);
  }

  /**
   * Updates a user note on an owned application.
   */
  async update(
    userId: string,
    applicationId: string,
    noteId: string,
    input: CreateNoteBody,
  ) {
    const owns = await this.repository.ownsApplication(userId, applicationId);
    if (!owns) {
      throw notFound("Application not found");
    }

    const row = await this.repository.updateNoteBody(
      userId,
      applicationId,
      noteId,
      input.body,
    );
    if (!row) {
      throw notFound("Note not found");
    }

    return toPublic(row);
  }

  /**
   * Deletes a user note from an owned application.
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
