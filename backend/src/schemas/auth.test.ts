import { describe, expect, it } from "vitest";

import { loginBodySchema, registerBodySchema } from "./auth.js";

describe("auth schemas", () => {
  it("accepts a valid registration payload", () => {
    const parsed = registerBodySchema.parse({
      email: "nima@example.com",
      password: "password123",
      name: "Nima",
    });

    expect(parsed.email).toBe("nima@example.com");
  });

  it("rejects short passwords", () => {
    const result = registerBodySchema.safeParse({
      email: "nima@example.com",
      password: "short",
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
