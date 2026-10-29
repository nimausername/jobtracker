import { Redis } from "ioredis";

import type { Env } from "../config/env.js";

export type RedisClient = Redis;

/**
 * Creates a Redis client when REDIS_URL is configured; otherwise null.
 * Returns null (and logs) if the initial connection/auth fails.
 * Keeps reconnecting afterward so a dropped Coolify Redis link does not
 * turn every rate-limited request into a 500.
 */
export const createRedisClient = async (
  env: Env,
  log?: {
    readonly warn: (obj: unknown, msg?: string) => void;
    readonly info?: (obj: unknown, msg?: string) => void;
  },
): Promise<RedisClient | null> => {
  if (!env.REDIS_URL) {
    return null;
  }

  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 8_000,
    // Reconnect after drops (Coolify Redis idle/restart). Cap backoff at 5s.
    retryStrategy: (times) => Math.min(times * 200, 5_000),
    reconnectOnError: (error) => {
      const message = error.message.toUpperCase();
      // Auth failures should not loop forever.
      if (message.includes("WRONGPASS") || message.includes("NOAUTH")) {
        return false;
      }
      return true;
    },
  });

  redis.on("error", (error) => {
    log?.warn({ err: error }, "Redis client error");
  });

  redis.on("reconnecting", () => {
    log?.info?.({}, "Redis reconnecting");
  });

  redis.on("ready", () => {
    log?.info?.({}, "Redis ready");
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
