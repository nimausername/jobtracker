import type { RedisClient } from "./redis.js";
import { AppError, ErrorCode } from "./errors.js";

type AttemptState = {
  failures: number;
  windowStartedAt: number;
  lockedUntil: number | null;
};

export type AttemptThrottleOptions = {
  readonly prefix: string;
  readonly maxFailures?: number;
  readonly windowMs?: number;
  readonly lockoutMs?: number;
  readonly redis?: RedisClient | null;
};

const DEFAULT_MAX_FAILURES = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_LOCKOUT_MS = 15 * 60 * 1000;

/**
 * Failure tracker with temporary lockouts.
 * Uses Redis when available; falls back to in-memory for single-process/dev.
 */
export class AttemptThrottle {
  private readonly attempts = new Map<string, AttemptState>();
  private readonly prefix: string;
  private readonly maxFailures: number;
  private readonly windowMs: number;
  private readonly lockoutMs: number;
  private readonly redis: RedisClient | null;

  constructor(options: AttemptThrottleOptions) {
    this.prefix = options.prefix;
    this.maxFailures = options.maxFailures ?? DEFAULT_MAX_FAILURES;
    this.windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
    this.lockoutMs = options.lockoutMs ?? DEFAULT_LOCKOUT_MS;
    this.redis = options.redis ?? null;
  }

  private redisKey(key: string): string {
    return `throttle:${this.prefix}:${key}`;
  }

  /**
   * Throws RATE_LIMITED when the key is currently locked out.
   */
  async assertAllowed(key: string, now = Date.now()): Promise<void> {
    const state = await this.readState(key);
    if (!state) {
      return;
    }

    if (state.lockedUntil !== null && state.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((state.lockedUntil - now) / 1000);
      throw new AppError(
        ErrorCode.RATE_LIMITED,
        "Too many attempts. Please try again later.",
        429,
        [{ reason: "LOCKED", field: "email" }],
        { retryAfterSeconds },
      );
    }

    if (state.lockedUntil !== null && state.lockedUntil <= now) {
      await this.clear(key);
    }
  }

  /**
   * Records a failure and may lock the key.
   */
  async recordFailure(key: string, now = Date.now()): Promise<void> {
    const existing = await this.readState(key);

    if (!existing || now - existing.windowStartedAt > this.windowMs) {
      await this.writeState(key, {
        failures: 1,
        windowStartedAt: now,
        lockedUntil: null,
      });
      return;
    }

    const failures = existing.failures + 1;
    const lockedUntil =
      failures >= this.maxFailures ? now + this.lockoutMs : null;

    await this.writeState(key, {
      failures,
      windowStartedAt: existing.windowStartedAt,
      lockedUntil,
    });
  }

  /**
   * Clears failures after a successful attempt.
   */
  async recordSuccess(key: string): Promise<void> {
    await this.clear(key);
  }

  /**
   * Test helper — current failure count for a key.
   */
  async getFailureCount(key: string, now = Date.now()): Promise<number> {
    const state = await this.readState(key);
    if (!state) {
      return 0;
    }
    if (state.lockedUntil !== null && state.lockedUntil <= now) {
      return 0;
    }
    if (
      now - state.windowStartedAt > this.windowMs &&
      state.lockedUntil === null
    ) {
      return 0;
    }
    return state.failures;
  }

  /**
   * Test helper — wipe one key or all in-memory state.
   */
  async clearAll(): Promise<void> {
    this.attempts.clear();
  }

  private async clear(key: string): Promise<void> {
    this.attempts.delete(key);
    if (this.redis) {
      try {
        await this.redis.del(this.redisKey(key));
      } catch {
        // Redis blip — local clear still applied.
      }
    }
  }

  private async readState(key: string): Promise<AttemptState | null> {
    if (this.redis) {
      try {
        const raw = await this.redis.get(this.redisKey(key));
        if (!raw) {
          return this.attempts.get(key) ?? null;
        }
        try {
          return JSON.parse(raw) as AttemptState;
        } catch {
          return this.attempts.get(key) ?? null;
        }
      } catch {
        return this.attempts.get(key) ?? null;
      }
    }

    return this.attempts.get(key) ?? null;
  }

  private async writeState(key: string, state: AttemptState): Promise<void> {
    this.attempts.set(key, state);

    if (this.redis) {
      try {
        const ttlMs = Math.max(
          this.windowMs,
          state.lockedUntil ? state.lockedUntil - Date.now() : 0,
        );
        await this.redis.set(
          this.redisKey(key),
          JSON.stringify(state),
          "PX",
          Math.max(ttlMs, 1000),
        );
      } catch {
        // Keep in-memory copy when Redis is briefly down.
      }
    }
  }
}

/**
 * Builds a stable throttle key from normalized email and client IP.
 */
export const emailIpThrottleKey = (email: string, ip: string): string =>
  `${email.trim().toLowerCase()}|${ip}`;

/**
 * Builds a stable throttle key from normalized email only.
 */
export const emailThrottleKey = (email: string): string =>
  email.trim().toLowerCase();
