import { tokenStore } from "@/lib/auth/token-store";

import type { ApiErrorBody, ApiSuccess, AuthTokens } from "./types";

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

const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${getBaseUrl()}/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      tokenStore.clear();
      return false;
    }

    const json = (await response.json()) as ApiSuccess<AuthTokens>;
    tokenStore.setTokens(json.data.accessToken, json.data.refreshToken);
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
};

/**
 * Typed JSON fetch against the Job Tracker API.
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

  if (options.auth !== false) {
    const accessToken = tokenStore.getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (
    response.status === 401 &&
    options.auth !== false &&
    !options.skipRefresh
  ) {
    refreshPromise ??= refreshAccessToken().finally(() => {
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
