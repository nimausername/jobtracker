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

  constructor(
    status: number,
    code: string,
    message: string,
    requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

type RequestOptions = {
  readonly method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  readonly body?: unknown;
  readonly auth?: boolean;
  readonly skipRefresh?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

const refreshSession = async (): Promise<boolean> => {
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

    if (!response.ok) {
      return false;
    }

    await response.json();
    return true;
  } catch {
    return false;
  }
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
    refreshPromise ??= refreshSession().finally(() => {
      refreshPromise = null;
    });
    const refreshed = await refreshPromise;
    if (refreshed) {
      return apiRequest<T>(path, { ...options, skipRefresh: true });
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
    );
  }

  return (json as ApiSuccess<T>).data;
};

/**
 * Establishes or refreshes a cookie-backed session (typed helper).
 */
export type { AuthSession };
