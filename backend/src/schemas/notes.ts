import { z } from "zod";

/**
 * Create timeline note body.
 */
export const createNoteBodySchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export type CreateNoteBody = z.infer<typeof createNoteBodySchema>;
