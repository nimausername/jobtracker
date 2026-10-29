import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { ErrorCode } from "../lib/errors.js";
import type { RedisClient } from "../lib/redis.js";

type SecurityPluginOptions = {
  readonly redis?: RedisClient | null;
};

/**
 * Baseline HTTP hardening: security headers + global request rate limit.
 * Auth routes override with stricter per-route configs.
 * Uses Redis when provided so limits survive process restarts / multi-instance.
 */
const securityPluginImpl: FastifyPluginAsync<SecurityPluginOptions> = async (
  app,
  opts,
) => {
  await app.register(helmet, {
    // API-only; CSP is enforced by the Next.js frontend origin.
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });

  await app.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: "1 minute",
    // If Redis drops mid-flight, allow the request instead of returning 500.
    skipOnError: true,
    ...(opts.redis ? { redis: opts.redis, nameSpace: "jobtracker-rl-" } : {}),
    // Behind Coolify / reverse proxies; trustProxy is enabled on the Fastify instance.
    addHeadersOnExceeding: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
    },
    addHeaders: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
      "retry-after": true,
    },
    errorResponseBuilder: (_request, context) => {
      const retryAfterSeconds = Math.ceil(context.ttl / 1000);
      return {
        statusCode: 429,
        error: "Too Many Requests",
        message: "Too many requests. Please slow down and try again.",
        code: ErrorCode.RATE_LIMITED,
        retryAfterSeconds,
      };
    },
  });
};

export const securityPlugin = fp(securityPluginImpl, {
  name: "security-plugin",
});

/** Shared rate-limit configs for sensitive routes. */
export const authRateLimits = {
  login: {
    max: 10,
    timeWindow: "15 minutes",
  },
  register: {
    max: 5,
    timeWindow: "1 hour",
  },
  forgotPassword: {
    max: 5,
    timeWindow: "1 hour",
  },
  resetPassword: {
    max: 10,
    timeWindow: "1 hour",
  },
  refresh: {
    max: 30,
    timeWindow: "1 minute",
  },
  logout: {
    max: 30,
    timeWindow: "1 minute",
  },
} as const;

export const accountRateLimits = {
  export: {
    max: 10,
    timeWindow: "1 hour",
  },
  updateProfile: {
    max: 30,
    timeWindow: "1 hour",
  },
  changePassword: {
    max: 10,
    timeWindow: "1 hour",
  },
  delete: {
    max: 5,
    timeWindow: "1 hour",
  },
} as const;
