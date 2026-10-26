import { describe, expect, it, vi } from "vitest";

import { AppError } from "../../lib/errors.js";
import type { NotesRepository } from "../../repositories/notes-repository.js";
import { NotesService } from "./notes-service.js";

describe("NotesService", () => {
  it("rejects notes for applications the user does not own", async () => {
    const repository = {
      ownsApplication: vi.fn().mockResolvedValue(false),
    } as unknown as NotesRepository;

    const service = new NotesService(repository);

    await expect(service.list("user-1", "app-1")).rejects.toBeInstanceOf(
      AppError,
    );
    expect(repository.ownsApplication).toHaveBeenCalledWith("user-1", "app-1");
  });

  it("creates a note when the application is owned", async () => {
    const repository = {
      ownsApplication: vi.fn().mockResolvedValue(true),
      create: vi.fn().mockResolvedValue({
        id: "note-1",
        applicationId: "app-1",
        userId: "user-1",
        body: "Called recruiter",
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
      body: "Called recruiter",
      createdAt: "2026-01-02T00:00:00.000Z",
    });
  });
});
