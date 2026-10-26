import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AppError } from "./errors.js";
import { parseOrThrow } from "./validate.js";

describe("parseOrThrow", () => {
  it("returns parsed data", () => {
    const schema = z.object({ name: z.string() });
    expect(parseOrThrow(schema, { name: "Nima" })).toEqual({ name: "Nima" });
  });

  it("throws AppError with field details", () => {
    const schema = z.object({ email: z.string().email() });

    try {
      parseOrThrow(schema, { email: "not-an-email" });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      const appError = error as AppError;
      expect(appError.statusCode).toBe(400);
      expect(appError.details[0]?.field).toBe("email");
    }
  });
});
