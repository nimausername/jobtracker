import { randomUUID } from "node:crypto";

/**
 * Returns an incoming request id or generates a new one.
 */
export const resolveRequestId = (
  headerValue: string | string[] | undefined,
): string => {
  if (typeof headerValue === "string" && headerValue.trim().length > 0) {
    return headerValue.trim();
  }

  if (Array.isArray(headerValue) && headerValue[0]) {
    return headerValue[0];
  }

  return randomUUID();
};
