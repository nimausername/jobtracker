import { describe, expect, it } from "vitest";

import { loginBodySchema, registerBodySchema } from "./auth.js";

describe("auth schemas", () => {
  it("accepts a valid registration payload with legal acceptance", () => {
    const parsed = registerBodySchema.parse({
      email: "nima@example.com",
      password: "password123",
      name: "Nima",
      acceptedLegal: true,
      documentsVersion: "2026-10-26.3",
    });

    expect(parsed.email).toBe("nima@example.com");
    expect(parsed.acceptedLegal).toBe(true);
  });

  it("rejects registration without legal acceptance", () => {
    const result = registerBodySchema.safeParse({
      email: "nima@example.com",
      password: "password123",
      acceptedLegal: false,
      documentsVersion: "2026-10-26.3",
    });

    expect(result.success).toBe(false);
  });

  it("rejects short passwords", () => {
    const result = registerBodySchema.safeParse({
      email: "nima@example.com",
      password: "short",
      acceptedLegal: true,
      documentsVersion: "2026-10-26.3",
    });

    expect(result.success).toBe(false);
  });

  it("rejects passwords without a digit", () => {
    const result = registerBodySchema.safeParse({
      email: "nima@example.com",
      password: "passwordonly",
      acceptedLegal: true,
      documentsVersion: "2026-10-26.3",
    });

    expect(result.success).toBe(false);
  });

  it("rejects passwords without a letter", () => {
    const result = registerBodySchema.safeParse({
      email: "nima@example.com",
      password: "12345678",
      acceptedLegal: true,
      documentsVersion: "2026-10-26.3",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid login payload", () => {
    const parsed = loginBodySchema.parse({
      email: "nima@example.com",
      password: "password123",
    });
    expect(parsed.email).toBe("nima@example.com");
  });
});
