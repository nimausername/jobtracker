import { z } from "zod";

/**
 * Registration request body.
 */
export const registerBodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(120).optional(),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;

/**
 * Login request body.
 */
export const loginBodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

/**
 * Refresh request body.
 */
export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshBody = z.infer<typeof refreshBodySchema>;
