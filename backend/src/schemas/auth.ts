import { z } from "zod";

/**
 * Registration request body.
 * `acceptedLegal` must be true; `documentsVersion` must match published legal docs.
 */
export const registerBodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(120).optional(),
  acceptedLegal: z.literal(true, {
    errorMap: () => ({
      message: "You must accept the Terms of Service and Privacy Policy",
    }),
  }),
  documentsVersion: z.string().trim().min(1).max(32),
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
 * Refresh request body. Token may also come from the httpOnly refresh cookie.
 */
export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export type RefreshBody = z.infer<typeof refreshBodySchema>;
