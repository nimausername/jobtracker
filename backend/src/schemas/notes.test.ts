import { describe, expect, it } from "vitest";

import { createNoteBodySchema } from "./notes.js";

describe("note schemas", () => {
  it("accepts a non-empty note body", () => {
    const parsed = createNoteBodySchema.parse({
      body: "Sent follow-up email",
    });

    expect(parsed.body).toBe("Sent follow-up email");
  });

  it("rejects blank notes", () => {
    const result = createNoteBodySchema.safeParse({ body: "   " });
    expect(result.success).toBe(false);
  });
});
