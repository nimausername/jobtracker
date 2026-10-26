import { apiRequest } from "./client";
import type { AccountExport } from "./types";

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
