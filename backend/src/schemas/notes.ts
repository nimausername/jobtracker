import { z } from "zod";

import { applicationStatusSchema } from "./applications.js";

export const applicationActivityKindSchema = z.enum([
  "created",
  "status_change",
  "note",
]);

export type ApplicationActivityKind = z.infer<
  typeof applicationActivityKindSchema
>;

/**
 * Create timeline note body (user-authored activities only).
 */
export const createNoteBodySchema = z.object({
  body: z.string().trim().min(1).max(20000),
});

export type CreateNoteBody = z.infer<typeof createNoteBodySchema>;

/**
 * Internal activity create payload used by services.
 */
export const createActivityInputSchema = z.object({
  kind: applicationActivityKindSchema,
  body: z.string().trim().min(1).max(20000),
  fromStatus: applicationStatusSchema.optional().nullable(),
  toStatus: applicationStatusSchema.optional().nullable(),
});

export type CreateActivityInput = z.infer<typeof createActivityInputSchema>;
