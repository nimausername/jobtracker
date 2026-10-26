import { z } from "zod";

/**
 * Account deletion must be explicitly confirmed.
 */
export const deleteAccountBodySchema = z.object({
  confirmation: z.literal("DELETE"),
});

export type DeleteAccountBody = z.infer<typeof deleteAccountBodySchema>;
