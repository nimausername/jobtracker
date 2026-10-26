import type { FastifyRequest } from "fastify";

/**
 * Resolves the client IP, preferring the first X-Forwarded-For hop when present.
 * Requires Fastify `trustProxy` so forged headers are not trusted blindly.
 */
export const resolveClientIp = (request: FastifyRequest): string => {
  const forwardedFor = request.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return request.ip;
};
