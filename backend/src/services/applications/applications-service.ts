import { notFound } from "../../lib/errors.js";
import type { ApplicationsRepository } from "../../repositories/applications-repository.js";
import type { NotesRepository } from "../../repositories/notes-repository.js";
import type {
  ApplicationStatus,
  CreateApplicationBody,
  ListApplicationsQuery,
  UpdateApplicationBody,
} from "../../schemas/applications.js";

const statusLabel: Record<ApplicationStatus, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

/**
 * Maps a DB application row to the public API shape.
 */
const toPublic = (row: {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string | null;
  city: string | null;
  country: string | null;
  workArrangement: "onsite" | "hybrid" | "remote";
  status: ApplicationStatus;
  appliedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: row.id,
  companyName: row.companyName,
  jobTitle: row.jobTitle,
  jobUrl: row.jobUrl,
  city: row.city,
  country: row.country,
  workArrangement: row.workArrangement,
  status: row.status,
  appliedAt: row.appliedAt?.toISOString() ?? null,
  notes: row.notes,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

/**
 * Application domain use-cases.
 */
export class ApplicationsService {
  constructor(
    private readonly repository: ApplicationsRepository,
    private readonly notesRepository: NotesRepository,
  ) {}

  /**
   * Lists applications for the authenticated user.
   */
  async list(userId: string, query: ListApplicationsQuery) {
    const { items, nextCursor } = await this.repository.listForUser(
      userId,
      query,
    );

    return {
      items: items.map(toPublic),
      nextCursor,
    };
  }

  /**
   * Returns dashboard status counts.
   */
  async summary(userId: string) {
    const counts = await this.repository.countByStatus(userId);
    const byStatus = {
      wishlist: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
    };

    for (const row of counts) {
      byStatus[row.status] = row.count;
    }

    const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);

    return { total, byStatus };
  }

  /**
   * Gets one application.
   */
  async getById(userId: string, id: string) {
    const row = await this.repository.findByIdForUser(userId, id);
    if (!row) {
      throw notFound("Application not found");
    }
    return toPublic(row);
  }

  /**
   * Creates an application and records a created timeline event.
   */
  async create(userId: string, input: CreateApplicationBody) {
    const row = await this.repository.create(userId, input);
    await this.notesRepository.create(userId, row.id, {
      kind: "created",
      body: `Added to tracker as ${statusLabel[row.status]}`,
      toStatus: row.status,
    });
    return toPublic(row);
  }

  /**
   * Updates an application.
   * When status becomes applied and appliedAt is unset, stamps appliedAt now.
   * Status changes are recorded on the activity timeline.
   */
  async update(userId: string, id: string, input: UpdateApplicationBody) {
    const existing = await this.repository.findByIdForUser(userId, id);
    if (!existing) {
      throw notFound("Application not found");
    }

    let patch: UpdateApplicationBody = input;

    const nextStatus = input.status;
    const shouldStampAppliedAt =
      input.appliedAt === undefined &&
      !existing.appliedAt &&
      nextStatus !== undefined &&
      nextStatus !== "wishlist" &&
      (nextStatus === "applied" || existing.status === "wishlist");

    if (shouldStampAppliedAt) {
      patch = {
        ...input,
        appliedAt: new Date().toISOString(),
      };
    }

    const row = await this.repository.update(userId, id, patch);
    if (!row) {
      throw notFound("Application not found");
    }

    if (input.status !== undefined && input.status !== existing.status) {
      await this.notesRepository.create(userId, id, {
        kind: "status_change",
        body: `Moved from ${statusLabel[existing.status]} to ${statusLabel[input.status]}`,
        fromStatus: existing.status,
        toStatus: input.status,
      });
    }

    return toPublic(row);
  }

  /**
   * Deletes an application.
   */
  async delete(userId: string, id: string) {
    const deleted = await this.repository.delete(userId, id);
    if (!deleted) {
      throw notFound("Application not found");
    }
  }
}
