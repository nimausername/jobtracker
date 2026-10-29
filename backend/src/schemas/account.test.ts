import { describe, expect, it } from "vitest";

import {
  changePasswordBodySchema,
  updateProfileBodySchema,
} from "./account.js";

describe("updateProfileBodySchema", () => {
  it("accepts trimmed names", () => {
    const result = updateProfileBodySchema.parse({
      firstName: "  Ada ",
      lastName: " Lovelace ",
    });
    expect(result).toEqual({ firstName: "Ada", lastName: "Lovelace" });
  });

  it("rejects empty names", () => {
    expect(() =>
      updateProfileBodySchema.parse({ firstName: " ", lastName: "Lovelace" }),
    ).toThrow();
  });
});

describe("changePasswordBodySchema", () => {
  it("accepts a valid password change", () => {
    const result = changePasswordBodySchema.parse({
      currentPassword: "old-pass12",
      newPassword: "new-pass12",
    });
    expect(result.newPassword).toBe("new-pass12");
  });

  it("rejects when new password matches current", () => {
    const result = changePasswordBodySchema.safeParse({
      currentPassword: "same-pass1",
      newPassword: "same-pass1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects weak new passwords", () => {
    const result = changePasswordBodySchema.safeParse({
      currentPassword: "old-pass12",
      newPassword: "short",
    });
    expect(result.success).toBe(false);
  });
});
