import { notFound } from "../../lib/errors.js";
import type { ApplicationsRepository } from "../../repositories/applications-repository.js";
import type {
  CreateApplicationBody,
  ListApplicationsQuery,
  UpdateApplicationBody,
} from "../../schemas/applications.js";

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
  isRemote: boolean;
  status:
    | "wishlist"
    | "applied"
    | "interview"
    | "offer"
    | "rejected"
    | "withdrawn";
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
  isRemote: row.isRemote,
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
  constructor(private readonly repository: ApplicationsRepository) {}

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
   * Creates an application.
   */
  async create(userId: string, input: CreateApplicationBody) {
    const row = await this.repository.create(userId, input);
    return toPublic(row);
  }

  /**
   * Updates an application.
   */
  async update(userId: string, id: string, input: UpdateApplicationBody) {
    const row = await this.repository.update(userId, id, input);
    if (!row) {
      throw notFound("Application not found");
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
