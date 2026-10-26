import { apiRequest } from "./client";
import type { AuthTokens, AuthUser } from "./types";

export type RegisterInput = {
  readonly email: string;
  readonly password: string;
  readonly name?: string;
};

export type LoginInput = {
  readonly email: string;
  readonly password: string;
};

/**
 * Registers a new account via the API.
 */
export const registerRequest = (input: RegisterInput): Promise<AuthTokens> =>
  apiRequest<AuthTokens>("/v1/auth/register", {
    method: "POST",
    body: input,
    auth: false,
  });

/**
 * Logs in with email and password.
 */
export const loginRequest = (input: LoginInput): Promise<AuthTokens> =>
  apiRequest<AuthTokens>("/v1/auth/login", {
    method: "POST",
    body: input,
    auth: false,
  });

/**
 * Loads the current user profile.
 */
export const meRequest = (): Promise<AuthUser> =>
  apiRequest<AuthUser>("/v1/auth/me", { method: "GET" });
