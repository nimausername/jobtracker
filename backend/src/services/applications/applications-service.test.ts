import { describe, expect, it, vi } from "vitest";

import { AppError } from "../../lib/errors.js";
import type { ApplicationsRepository } from "../../repositories/applications-repository.js";
import type { NotesRepository } from "../../repositories/notes-repository.js";
import { ApplicationsService } from "./applications-service.js";

const baseRow = {
  id: "11111111-1111-1111-1111-111111111111",
  userId: "user-1",
  companyName: "Acme",
  jobTitle: "Engineer",
  jobUrl: null,
  city: "Berlin",
  country: "Germany",
  workArrangement: "onsite" as const,
  status: "applied" as const,
  appliedAt: null,
  notes: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const createNotesRepository = (
  overrides: Partial<NotesRepository> = {},
): NotesRepository =>
  ({
    create: vi.fn().mockResolvedValue({ id: "note-1" }),
    ...overrides,
  }) as unknown as NotesRepository;

describe("ApplicationsService", () => {
  it("maps summary counts and fills missing statuses with zero", async () => {
    const repository = {
      countByStatus: vi.fn().mockResolvedValue([
        { status: "applied", count: 2 },
        { status: "interview", count: 1 },
      ]),
    } as unknown as ApplicationsRepository;

    const service = new ApplicationsService(
      repository,
      createNotesRepository(),
    );
    const summary = await service.summary("user-1");

    expect(summary.total).toBe(3);
    expect(summary.byStatus.applied).toBe(2);
    expect(summary.byStatus.wishlist).toBe(0);
  });

  it("throws not found when updating a missing application", async () => {
    const repository = {
      findByIdForUser: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
    } as unknown as ApplicationsRepository;

    const service = new ApplicationsService(
      repository,
      createNotesRepository(),
    );

    await expect(
      service.update("user-1", baseRow.id, { status: "rejected" }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("stamps appliedAt when moving to applied without an existing date", async () => {
    const wishlistRow = {
      ...baseRow,
      status: "wishlist" as const,
      appliedAt: null,
    };
    const update = vi.fn().mockResolvedValue({
      ...wishlistRow,
      status: "applied",
      appliedAt: new Date("2026-03-01T12:00:00.000Z"),
    });
    const notesCreate = vi.fn().mockResolvedValue({ id: "note-1" });
    const repository = {
      findByIdForUser: vi.fn().mockResolvedValue(wishlistRow),
      update,
    } as unknown as ApplicationsRepository;

    const service = new ApplicationsService(
      repository,
      createNotesRepository({ create: notesCreate }),
    );
    await service.update("user-1", baseRow.id, { status: "applied" });

    expect(update).toHaveBeenCalledWith(
      "user-1",
      baseRow.id,
      expect.objectContaining({
        status: "applied",
        appliedAt: expect.any(String),
      }),
    );
    expect(notesCreate).toHaveBeenCalledWith(
      "user-1",
      baseRow.id,
      expect.objectContaining({
        kind: "status_change",
        fromStatus: "wishlist",
        toStatus: "applied",
      }),
    );
  });

  it("does not overwrite an existing appliedAt when status becomes applied", async () => {
    const appliedAt = new Date("2026-02-01T00:00:00.000Z");
    const existing = {
      ...baseRow,
      status: "interview" as const,
      appliedAt,
    };
    const update = vi.fn().mockResolvedValue({
      ...existing,
      status: "applied",
    });
    const repository = {
      findByIdForUser: vi.fn().mockResolvedValue(existing),
      update,
    } as unknown as ApplicationsRepository;

    const service = new ApplicationsService(
      repository,
      createNotesRepository(),
    );
    await service.update("user-1", baseRow.id, { status: "applied" });

    expect(update).toHaveBeenCalledWith("user-1", baseRow.id, {
      status: "applied",
    });
  });

  it("stamps appliedAt when leaving wishlist for a later pipeline status", async () => {
    const wishlistRow = {
      ...baseRow,
      status: "wishlist" as const,
      appliedAt: null,
    };
    const update = vi.fn().mockResolvedValue({
      ...wishlistRow,
      status: "interview",
      appliedAt: new Date("2026-03-01T12:00:00.000Z"),
    });
    const repository = {
      findByIdForUser: vi.fn().mockResolvedValue(wishlistRow),
      update,
    } as unknown as ApplicationsRepository;

    const service = new ApplicationsService(
      repository,
      createNotesRepository(),
    );
    await service.update("user-1", baseRow.id, { status: "interview" });

    expect(update).toHaveBeenCalledWith(
      "user-1",
      baseRow.id,
      expect.objectContaining({
        status: "interview",
        appliedAt: expect.any(String),
      }),
    );
  });

  it("records a created timeline event when creating an application", async () => {
    const create = vi.fn().mockResolvedValue({
      ...baseRow,
      status: "wishlist" as const,
    });
    const notesCreate = vi.fn().mockResolvedValue({ id: "note-1" });
    const repository = {
      create,
    } as unknown as ApplicationsRepository;

    const service = new ApplicationsService(
      repository,
      createNotesRepository({ create: notesCreate }),
    );
    await service.create("user-1", {
      companyName: "Acme",
      jobTitle: "Engineer",
      workArrangement: "onsite",
      status: "wishlist",
    });

    expect(notesCreate).toHaveBeenCalledWith(
      "user-1",
      baseRow.id,
      expect.objectContaining({
        kind: "created",
        toStatus: "wishlist",
      }),
    );
  });

  it("returns a public application shape", async () => {
    const repository = {
      findByIdForUser: vi.fn().mockResolvedValue(baseRow),
    } as unknown as ApplicationsRepository;

    const service = new ApplicationsService(
      repository,
      createNotesRepository(),
    );
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
