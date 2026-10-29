import { apiRequest } from "./client";
import type { AccountExport, AuthUser } from "./types";

export type UpdateProfileInput = {
  readonly firstName: string;
  readonly lastName: string;
};

export type ChangePasswordInput = {
  readonly currentPassword: string;
  readonly newPassword: string;
};

/**
 * Updates the signed-in user's first and last name.
 */
export const updateProfileRequest = (
  input: UpdateProfileInput,
): Promise<AuthUser> =>
  apiRequest<AuthUser>("/v1/account/profile", {
    method: "PATCH",
    body: input,
  });

/**
 * Changes the signed-in user's password after verifying the current one.
 */
export const changePasswordRequest = (
  input: ChangePasswordInput,
): Promise<void> =>
  apiRequest<void>("/v1/account/password", {
    method: "POST",
    body: input,
  });

/**
 * Downloads a portable export of the signed-in user's data.
 */
export const exportAccountRequest = (): Promise<AccountExport> =>
  apiRequest<AccountExport>("/v1/account/export", { method: "GET" });

/**
 * Permanently deletes the signed-in account and related data.
 */
export const deleteAccountRequest = (): Promise<void> =>
  apiRequest<void>("/v1/account", {
    method: "DELETE",
    body: { confirmation: "DELETE" },
  });
