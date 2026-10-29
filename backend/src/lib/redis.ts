import { Redis } from "ioredis";

import type { Env } from "../config/env.js";

export type RedisClient = Redis;

/**
 * Creates a Redis client when REDIS_URL is configured; otherwise null.
 * Returns null (and logs) if Redis is unreachable or credentials are wrong,
 * so the API can fall back to in-memory rate limits.
 */
export const createRedisClient = async (
  env: Env,
  log?: { readonly warn: (obj: unknown, msg?: string) => void },
): Promise<RedisClient | null> => {
  if (!env.REDIS_URL) {
    return null;
  }

  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 8_000,
    retryStrategy: () => null,
  });

  redis.on("error", () => {
    // Suppress unhandled error spam; connect() failure is handled below.
  });

  try {
    await redis.connect();
    const pong = await redis.ping();
    if (pong !== "PONG") {
      throw new Error(`Unexpected Redis ping response: ${pong}`);
    }
    return redis;
  } catch (error) {
    log?.warn(
      { err: error },
      "Redis unavailable; falling back to in-memory rate limits",
    );
    try {
      redis.disconnect();
    } catch {
      // ignore cleanup errors
    }
    return null;
  }
};
