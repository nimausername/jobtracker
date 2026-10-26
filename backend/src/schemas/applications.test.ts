import { describe, expect, it } from "vitest";

import {
  createApplicationBodySchema,
  listApplicationsQuerySchema,
  updateApplicationBodySchema,
} from "./applications.js";

describe("application schemas", () => {
  it("accepts a minimal create payload", () => {
    const parsed = createApplicationBodySchema.parse({
      companyName: "Acme",
      jobTitle: "Engineer",
    });

    expect(parsed.status).toBe("wishlist");
    expect(parsed.isRemote).toBe(false);
  });

  it("rejects an empty company name", () => {
    const result = createApplicationBodySchema.safeParse({
      companyName: "   ",
      jobTitle: "Engineer",
    });

    expect(result.success).toBe(false);
  });

  it("parses list query defaults", () => {
    const parsed = listApplicationsQuerySchema.parse({});
    expect(parsed.limit).toBe(20);
  });

  it("requires at least one field on update", () => {
    const result = updateApplicationBodySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts a status-only update", () => {
    const parsed = updateApplicationBodySchema.parse({ status: "interview" });
    expect(parsed.status).toBe("interview");
  });
});
