import { describe, expect, it } from "vitest";

import { resolveDisplayNames } from "./admin-client.js";

describe("resolveDisplayNames", () => {
  it("uses email local-part when name is missing", () => {
    expect(resolveDisplayNames({ email: "ada@example.com" })).toEqual({
      firstName: "ada",
      lastName: "ada",
    });
  });

  it("duplicates a single given name so Keycloak profile is complete", () => {
    expect(
      resolveDisplayNames({ email: "ada@example.com", name: "nima123" }),
    ).toEqual({
      firstName: "nima123",
      lastName: "nima123",
    });
  });

  it("splits multi-word names into first and last", () => {
    expect(
      resolveDisplayNames({
        email: "ada@example.com",
        name: "Nima Khabbazi",
      }),
    ).toEqual({
      firstName: "Nima",
      lastName: "Khabbazi",
    });
  });

  it("prefers explicit first and last name over legacy name", () => {
    expect(
      resolveDisplayNames({
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        name: "Ignored Name",
      }),
    ).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
    });
  });
});
