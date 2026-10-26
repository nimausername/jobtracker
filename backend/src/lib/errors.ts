/**
 * Stable machine-readable API error codes.
 */
export const ErrorCode = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL: "INTERNAL",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export type ErrorDetail = {
  readonly field?: string;
  readonly reason: string;
};

export type AppErrorOptions = {
  readonly retryAfterSeconds?: number;
};

/**
 * Application error with HTTP status and stable code.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details: readonly ErrorDetail[];
  readonly retryAfterSeconds?: number;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details: readonly ErrorDetail[] = [],
    options: AppErrorOptions = {},
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    if (options.retryAfterSeconds !== undefined) {
      this.retryAfterSeconds = options.retryAfterSeconds;
    }
  }
}

/**
 * Creates a 400 Bad Request error.
 */
export const badRequest = (
  message: string,
  details: readonly ErrorDetail[] = [],
): AppError => new AppError(ErrorCode.BAD_REQUEST, message, 400, details);

/**
 * Creates a 401 Unauthorized error.
 */
export const unauthorized = (message = "Unauthorized"): AppError =>
  new AppError(ErrorCode.UNAUTHORIZED, message, 401);

/**
 * Creates a 403 Forbidden error.
 */
export const forbidden = (message = "Forbidden"): AppError =>
  new AppError(ErrorCode.FORBIDDEN, message, 403);

/**
 * Creates a 404 Not Found error.
 */
export const notFound = (message = "Not found"): AppError =>
  new AppError(ErrorCode.NOT_FOUND, message, 404);

/**
 * Creates a 409 Conflict error.
 */
export const conflict = (message: string): AppError =>
  new AppError(ErrorCode.CONFLICT, message, 409);

/**
 * Creates a 429 Too Many Requests error.
 */
export const rateLimited = (
  message = "Too many requests. Please try again later.",
  retryAfterSeconds?: number,
): AppError =>
  new AppError(ErrorCode.RATE_LIMITED, message, 429, [], {
    ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {}),
  });
