import { z } from "zod";

/**
 * Registration passwords: 8–128 chars, at least one letter and one digit.
 */
export const registerPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

const personNameSchema = z.string().trim().min(1).max(60);

const turnstileTokenSchema = z.string().trim().min(1).max(2048).optional();

/**
 * Registration request body.
 * `acceptedLegal` must be true; `documentsVersion` must match published legal docs.
 * Prefer `firstName` + `lastName`. Optional `name` remains for older clients.
 */
export const registerBodySchema = z
  .object({
    email: z.string().email().max(255),
    password: registerPasswordSchema,
    firstName: personNameSchema.optional(),
    lastName: personNameSchema.optional(),
    name: z.string().trim().min(1).max(120).optional(),
    turnstileToken: turnstileTokenSchema,
    acceptedLegal: z.literal(true, {
      errorMap: () => ({
        message: "You must accept the Terms of Service and Privacy Policy",
      }),
    }),
    documentsVersion: z.string().trim().min(1).max(32),
  })
  .superRefine((data, ctx) => {
    const hasFirst = Boolean(data.firstName);
    const hasLast = Boolean(data.lastName);

    if (hasFirst === hasLast) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Both first and last name are required",
      path: [hasFirst ? "lastName" : "firstName"],
    });
  });

export type RegisterBody = z.infer<typeof registerBodySchema>;

/**
 * Login request body.
 */
export const loginBodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
  turnstileToken: turnstileTokenSchema,
});

export type LoginBody = z.infer<typeof loginBodySchema>;

/**
 * Forgot-password request body.
 */
export const forgotPasswordBodySchema = z.object({
  email: z.string().email().max(255),
  turnstileToken: turnstileTokenSchema,
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;

/**
 * Reset-password request body (in-app token flow).
 */
export const resetPasswordBodySchema = z.object({
  token: z.string().trim().min(20).max(256),
  password: registerPasswordSchema,
});

export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;

/**
 * Refresh request body. Token may also come from the httpOnly refresh cookie.
 */
export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export type RefreshBody = z.infer<typeof refreshBodySchema>;
