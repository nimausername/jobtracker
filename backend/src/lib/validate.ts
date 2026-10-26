import type { ZodTypeAny, z } from "zod";

import { badRequest } from "./errors.js";

/**
 * Parses input with Zod and maps failures to a stable API error.
 */
export const parseOrThrow = <TSchema extends ZodTypeAny>(
  schema: TSchema,
  input: unknown,
): z.infer<TSchema> => {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw badRequest(
      "Validation failed",
      result.error.issues.map((issue) => {
        const field = issue.path.join(".");
        return field
          ? { field, reason: issue.message }
          : { reason: issue.message };
      }),
    );
  }

  return result.data;
};
