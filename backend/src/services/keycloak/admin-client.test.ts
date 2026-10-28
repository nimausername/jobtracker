import { describe, expect, it } from "vitest";

import { resolveDisplayNames } from "./admin-client.js";

describe("resolveDisplayNames", () => {
  it("uses email local-part when name is missing", () => {
    expect(resolveDisplayNames("ada@example.com")).toEqual({
      firstName: "ada",
      lastName: "ada",
    });
  });

  it("duplicates a single given name so Keycloak profile is complete", () => {
    expect(resolveDisplayNames("ada@example.com", "nima123")).toEqual({
      firstName: "nima123",
      lastName: "nima123",
    });
  });

  it("splits multi-word names into first and last", () => {
    expect(resolveDisplayNames("ada@example.com", "Nima Khabbazi")).toEqual({
      firstName: "Nima",
      lastName: "Khabbazi",
    });
  });
});
