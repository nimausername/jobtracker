import { z } from "zod";

import { registerPasswordSchema } from "./auth.js";

const personNameSchema = z.string().trim().min(1).max(60);

/**
 * Account deletion must be explicitly confirmed.
 */
export const deleteAccountBodySchema = z.object({
  confirmation: z.literal("DELETE"),
});

export type DeleteAccountBody = z.infer<typeof deleteAccountBodySchema>;

/**
 * Profile update — first and last name required.
 */
export const updateProfileBodySchema = z.object({
  firstName: personNameSchema,
  lastName: personNameSchema,
});

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;

/**
 * In-app password change — requires the current password.
 */
export const changePasswordBodySchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: registerPasswordSchema,
  })
  .superRefine((data, ctx) => {
    if (data.currentPassword === data.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password must be different from your current password",
        path: ["newPassword"],
      });
    }
  });

export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;
