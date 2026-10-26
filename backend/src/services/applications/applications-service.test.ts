import { describe, expect, it, vi } from "vitest";

import { AppError } from "../../lib/errors.js";
import type { ApplicationsRepository } from "../../repositories/applications-repository.js";
import { ApplicationsService } from "./applications-service.js";

const baseRow = {
  id: "11111111-1111-1111-1111-111111111111",
  userId: "user-1",
  companyName: "Acme",
  jobTitle: "Engineer",
  jobUrl: null,
  city: "Berlin",
  country: "Germany",
  isRemote: false,
  status: "applied" as const,
  appliedAt: null,
  notes: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("ApplicationsService", () => {
  it("maps summary counts and fills missing statuses with zero", async () => {
    const repository = {
      countByStatus: vi.fn().mockResolvedValue([
        { status: "applied", count: 2 },
        { status: "interview", count: 1 },
      ]),
    } as unknown as ApplicationsRepository;

    const service = new ApplicationsService(repository);
    const summary = await service.summary("user-1");

    expect(summary.total).toBe(3);
    expect(summary.byStatus.applied).toBe(2);
    expect(summary.byStatus.wishlist).toBe(0);
  });

  it("throws not found when updating a missing application", async () => {
    const repository = {
      update: vi.fn().mockResolvedValue(undefined),
    } as unknown as ApplicationsRepository;

    const service = new ApplicationsService(repository);

    await expect(
      service.update("user-1", baseRow.id, { status: "rejected" }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("returns a public application shape", async () => {
    const repository = {
      findByIdForUser: vi.fn().mockResolvedValue(baseRow),
    } as unknown as ApplicationsRepository;

    const service = new ApplicationsService(repository);
    const result = await service.getById("user-1", baseRow.id);

    expect(result).toMatchObject({
      id: baseRow.id,
      companyName: "Acme",
      city: "Berlin",
      status: "applied",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });
});
