import { describe, expect, it, vi } from "vitest";

import { AppError } from "../../lib/errors.js";
import type { NotesRepository } from "../../repositories/notes-repository.js";
import { NotesService } from "./notes-service.js";

describe("NotesService", () => {
  it("rejects notes for applications the user does not own", async () => {
    const repository = {
      findApplicationForUser: vi.fn().mockResolvedValue(undefined),
    } as unknown as NotesRepository;

    const service = new NotesService(repository);

    await expect(service.list("user-1", "app-1")).rejects.toBeInstanceOf(
      AppError,
    );
  });

  it("seeds a created milestone when none exists", async () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const repository = {
      findApplicationForUser: vi.fn().mockResolvedValue({
        id: "app-1",
        status: "rejected",
        appliedAt: null,
        createdAt,
      }),
      listForApplication: vi.fn().mockResolvedValue([
        {
          id: "note-1",
          applicationId: "app-1",
          userId: "user-1",
          kind: "note",
          body: "Called recruiter",
          fromStatus: null,
          toStatus: null,
          createdAt: new Date("2026-01-02T00:00:00.000Z"),
        },
      ]),
    } as unknown as NotesRepository;

    const service = new NotesService(repository);
    const activities = await service.list("user-1", "app-1");

    expect(activities).toHaveLength(2);
    expect(activities[0]?.kind).toBe("note");
    expect(activities[1]).toMatchObject({
      kind: "created",
      deletable: false,
      createdAt: createdAt.toISOString(),
    });
  });

  it("creates a note when the application is owned", async () => {
    const repository = {
      ownsApplication: vi.fn().mockResolvedValue(true),
      create: vi.fn().mockResolvedValue({
        id: "note-1",
        applicationId: "app-1",
        userId: "user-1",
        kind: "note",
        body: "Called recruiter",
        fromStatus: null,
        toStatus: null,
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
      }),
    } as unknown as NotesRepository;

    const service = new NotesService(repository);
    const note = await service.create("user-1", "app-1", {
      body: "Called recruiter",
    });

    expect(note).toEqual({
      id: "note-1",
      applicationId: "app-1",
      kind: "note",
      body: "Called recruiter",
      fromStatus: null,
      toStatus: null,
      createdAt: "2026-01-02T00:00:00.000Z",
      deletable: true,
    });
    expect(repository.create).toHaveBeenCalledWith("user-1", "app-1", {
      kind: "note",
      body: "Called recruiter",
    });
  });
});
