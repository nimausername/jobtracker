import type { ApiErrorBody, ApiSuccess, AuthSession } from "./types";

const getBaseUrl = (): string => {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return base.replace(/\/$/, "");
};

/**
 * Client-side API error with stable code.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly details: ReadonlyArray<{
    readonly field?: string;
    readonly reason: string;
  }>;

  constructor(
    status: number,
    code: string,
    message: string,
    requestId?: string,
    details: ReadonlyArray<{
      readonly field?: string;
      readonly reason: string;
    }> = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

type RequestOptions = {
  readonly method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  readonly body?: unknown;
  readonly auth?: boolean;
  readonly skipRefresh?: boolean;
};

type AuthSessionHandlers = {
  readonly onRefreshed?: (session: AuthSession) => void;
  readonly onExpired?: () => void;
};

/** Outcome of a cookie-backed session refresh attempt. */
export type RefreshSessionResult =
  | { readonly ok: true; readonly session: AuthSession }
  | {
      readonly ok: false;
      /** `unauthorized` means the refresh cookie is gone/invalid; `transient` is network/5xx. */
      readonly reason: "unauthorized" | "transient";
    };

let refreshPromise: Promise<RefreshSessionResult> | null = null;
let authSessionHandlers: AuthSessionHandlers = {};

/**
 * Registers callbacks for session refresh success and permanent expiry.
 */
export const setAuthSessionHandlers = (
  handlers: AuthSessionHandlers,
): void => {
  authSessionHandlers = handlers;
};

/**
 * Refreshes the cookie-backed session via the API.
 * Single-flights concurrent callers onto one network request.
 * Does not clear auth state on failure — callers decide.
 */
export const refreshSession = async (): Promise<AuthSession | null> => {
  const result = await refreshSessionDetailed();
  return result.ok ? result.session : null;
};

/**
 * Refreshes the session and distinguishes auth rejection from transient failures.
 */
export const refreshSessionDetailed =
  async (): Promise<RefreshSessionResult> => {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async (): Promise<RefreshSessionResult> => {
      try {
        const response = await fetch(`${getBaseUrl()}/v1/auth/refresh`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({}),
        });

        if (response.status === 401 || response.status === 403) {
          return { ok: false, reason: "unauthorized" };
        }

        if (!response.ok) {
          return { ok: false, reason: "transient" };
        }

        const json = (await response.json()) as ApiSuccess<AuthSession>;
        const session = json.data;
        authSessionHandlers.onRefreshed?.(session);
        return { ok: true, session };
      } catch {
        return { ok: false, reason: "transient" };
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

/**
 * Typed JSON fetch against the Job Tracker API.
 * Auth uses httpOnly cookies via `credentials: "include"`.
 */
export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    headers,
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (
    response.status === 401 &&
    options.auth !== false &&
    !options.skipRefresh
  ) {
    const refreshed = await refreshSessionDetailed();
    if (refreshed.ok) {
      return apiRequest<T>(path, { ...options, skipRefresh: true });
    }
    // Only clear the client session when the refresh cookie is actually invalid.
    // Transient refresh failures must not log the user out.
    if (refreshed.reason === "unauthorized") {
      authSessionHandlers.onExpired?.();
    } else {
      throw new ApiError(
        503,
        "SESSION_REFRESH_TRANSIENT",
        "Session refresh failed temporarily",
      );
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = (await response.json()) as ApiSuccess<T> | ApiErrorBody;

  if (!response.ok) {
    const errorBody = json as ApiErrorBody;
    throw new ApiError(
      response.status,
      errorBody.error?.code ?? "INTERNAL",
      errorBody.error?.message ?? "Request failed",
      errorBody.meta?.requestId,
      errorBody.error?.details ?? [],
    );
  }

  return (json as ApiSuccess<T>).data;
};

/**
 * Establishes or refreshes a cookie-backed session (typed helper).
 */
export type { AuthSession };
