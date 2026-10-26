import { and, desc, eq, ilike, lt, or, sql } from "drizzle-orm";

import type { Database } from "../db/client.js";
import { applications } from "../db/schema/index.js";
import type {
  ApplicationStatus,
  CreateApplicationBody,
  ListApplicationsQuery,
  UpdateApplicationBody,
} from "../schemas/applications.js";

export type ApplicationRecord = typeof applications.$inferSelect;

/**
 * Database access for job applications.
 */
export class ApplicationsRepository {
  constructor(private readonly db: Database) {}

  /**
   * Lists applications for a user with optional search and status filter.
   */
  async listForUser(
    userId: string,
    query: ListApplicationsQuery,
  ): Promise<{ readonly items: ApplicationRecord[]; readonly nextCursor: string | null }> {
    const filters = [eq(applications.userId, userId)];

    if (query.status) {
      filters.push(eq(applications.status, query.status));
    }

    if (query.q) {
      const pattern = `%${query.q}%`;
      filters.push(
        or(
          ilike(applications.companyName, pattern),
          ilike(applications.jobTitle, pattern),
        )!,
      );
    }

    if (query.cursor) {
      const cursorRow = await this.db.query.applications.findFirst({
        where: and(
          eq(applications.id, query.cursor),
          eq(applications.userId, userId),
        ),
      });

      if (cursorRow) {
        filters.push(lt(applications.createdAt, cursorRow.createdAt));
      }
    }

    const items = await this.db
      .select()
      .from(applications)
      .where(and(...filters))
      .orderBy(desc(applications.createdAt))
      .limit(query.limit + 1);

    const hasMore = items.length > query.limit;
    const page = hasMore ? items.slice(0, query.limit) : items;
    const nextCursor = hasMore ? (page.at(-1)?.id ?? null) : null;

    return { items: page, nextCursor };
  }

  /**
   * Counts applications grouped by status for a user.
   */
  async countByStatus(
    userId: string,
  ): Promise<ReadonlyArray<{ status: ApplicationStatus; count: number }>> {
    const rows = await this.db
      .select({
        status: applications.status,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(applications)
      .where(eq(applications.userId, userId))
      .groupBy(applications.status);

    return rows.map((row) => ({
      status: row.status,
      count: Number(row.count),
    }));
  }

  /**
   * Finds one application owned by the user.
   */
  async findByIdForUser(
    userId: string,
    id: string,
  ): Promise<ApplicationRecord | undefined> {
    return this.db.query.applications.findFirst({
      where: and(eq(applications.id, id), eq(applications.userId, userId)),
    });
  }

  /**
   * Creates an application for the user.
   */
  async create(
    userId: string,
    input: CreateApplicationBody,
  ): Promise<ApplicationRecord> {
    const [row] = await this.db
      .insert(applications)
      .values({
        userId,
        companyName: input.companyName,
        jobTitle: input.jobTitle,
        jobUrl: emptyToNull(input.jobUrl),
        city: emptyToNull(input.city),
        country: emptyToNull(input.country),
        isRemote: input.isRemote,
        status: input.status,
        appliedAt: input.appliedAt ? new Date(input.appliedAt) : null,
        notes: emptyToNull(input.notes),
      })
      .returning();

    if (!row) {
      throw new Error("Insert returned no row");
    }

    return row;
  }

  /**
   * Updates an application owned by the user.
   */
  async update(
    userId: string,
    id: string,
    input: UpdateApplicationBody,
  ): Promise<ApplicationRecord | undefined> {
    const [row] = await this.db
      .update(applications)
      .set({
        ...(input.companyName !== undefined
          ? { companyName: input.companyName }
          : {}),
        ...(input.jobTitle !== undefined ? { jobTitle: input.jobTitle } : {}),
        ...(input.jobUrl !== undefined
          ? { jobUrl: emptyToNull(input.jobUrl) }
          : {}),
        ...(input.city !== undefined ? { city: emptyToNull(input.city) } : {}),
        ...(input.country !== undefined
          ? { country: emptyToNull(input.country) }
          : {}),
        ...(input.isRemote !== undefined ? { isRemote: input.isRemote } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.appliedAt !== undefined
          ? {
              appliedAt: input.appliedAt ? new Date(input.appliedAt) : null,
            }
          : {}),
        ...(input.notes !== undefined
          ? { notes: emptyToNull(input.notes) }
          : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(applications.id, id), eq(applications.userId, userId)))
      .returning();

    return row;
  }

  /**
   * Deletes an application owned by the user.
   */
  async delete(userId: string, id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, userId)))
      .returning({ id: applications.id });

    return deleted.length > 0;
  }
}

const emptyToNull = (value: string | undefined): string | null => {
  if (value === undefined || value.trim() === "") {
    return null;
  }
  return value;
};
