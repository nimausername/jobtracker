import { apiRequest, refreshSession } from "./client";
import type { AuthSession, AuthUser, RegisterResult } from "./types";

export type RegisterInput = {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly acceptedLegal: true;
  readonly documentsVersion: string;
  readonly turnstileToken?: string;
};

export type LoginInput = {
  readonly email: string;
  readonly password: string;
  readonly turnstileToken?: string;
};

export type ForgotPasswordInput = {
  readonly email: string;
  readonly turnstileToken?: string;
};

export type AuthPublicConfig = {
  readonly turnstileSiteKey: string | null;
  readonly turnstileEnabled: boolean;
};

export type ForgotPasswordResult = {
  readonly sent: true;
};

export type ResetPasswordInput = {
  readonly token: string;
  readonly password: string;
};

export type ResetPasswordResult = {
  readonly reset: true;
};

/**
 * Public auth config (Turnstile site key, feature flags).
 */
export const getAuthPublicConfig = (): Promise<AuthPublicConfig> =>
  apiRequest<AuthPublicConfig>("/v1/auth/public-config", {
    method: "GET",
    auth: false,
  });

/**
 * Registers a new account via the API. Does not create a session.
 */
export const registerRequest = (input: RegisterInput): Promise<RegisterResult> =>
  apiRequest<RegisterResult>("/v1/auth/register", {
    method: "POST",
    body: input,
    auth: false,
  });

/**
 * Requests an in-app password-reset email. Always succeeds from the client view
 * when the mailbox is configured.
 */
export const forgotPasswordRequest = (
  input: ForgotPasswordInput,
): Promise<ForgotPasswordResult> =>
  apiRequest<ForgotPasswordResult>("/v1/auth/forgot-password", {
    method: "POST",
    body: input,
    auth: false,
  });

/**
 * Completes an in-app password reset with the emailed token.
 */
export const resetPasswordRequest = (
  input: ResetPasswordInput,
): Promise<ResetPasswordResult> =>
  apiRequest<ResetPasswordResult>("/v1/auth/reset-password", {
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

/**
 * Proactively refreshes the cookie-backed session.
 */
export const refreshRequest = (): Promise<AuthSession | null> =>
  refreshSession();
