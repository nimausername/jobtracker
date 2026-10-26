import { apiRequest } from "./client";
import type { AuthSession, AuthUser } from "./types";

export type RegisterInput = {
  readonly email: string;
  readonly password: string;
  readonly name?: string;
  readonly acceptedLegal: true;
  readonly documentsVersion: string;
};

export type LoginInput = {
  readonly email: string;
  readonly password: string;
};

/**
 * Registers a new account via the API (sets httpOnly cookies).
 */
export const registerRequest = (input: RegisterInput): Promise<AuthSession> =>
  apiRequest<AuthSession>("/v1/auth/register", {
    method: "POST",
    body: input,
    auth: false,
  });

/**
 * Logs in with email and password (sets httpOnly cookies).
 */
export const loginRequest = (input: LoginInput): Promise<AuthSession> =>
  apiRequest<AuthSession>("/v1/auth/login", {
    method: "POST",
    body: input,
    auth: false,
  });

/**
 * Clears auth cookies on the API.
 */
export const logoutRequest = (): Promise<void> =>
  apiRequest<void>("/v1/auth/logout", {
    method: "POST",
    auth: false,
    skipRefresh: true,
  });

/**
 * Loads the current user profile.
 */
export const meRequest = (): Promise<AuthUser> =>
  apiRequest<AuthUser>("/v1/auth/me", { method: "GET" });
