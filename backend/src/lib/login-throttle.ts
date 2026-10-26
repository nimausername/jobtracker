import { AppError, ErrorCode } from "./errors.js";

type AttemptState = {
  failures: number;
  windowStartedAt: number;
  lockedUntil: number | null;
};

export type LoginThrottleOptions = {
  /** Failed attempts allowed inside the sliding window before lockout. */
  readonly maxFailures?: number;
  /** Window that counts failures (ms). */
  readonly windowMs?: number;
  /** Lock duration after exceeding maxFailures (ms). */
  readonly lockoutMs?: number;
};

const DEFAULT_MAX_FAILURES = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_LOCKOUT_MS = 15 * 60 * 1000;

/**
 * In-memory per-key login failure tracker with temporary lockouts.
 * Suitable for a single API process; use Redis if you scale horizontally.
 */
export class LoginThrottle {
  private readonly attempts = new Map<string, AttemptState>();
  private readonly maxFailures: number;
  private readonly windowMs: number;
  private readonly lockoutMs: number;

  constructor(options: LoginThrottleOptions = {}) {
    this.maxFailures = options.maxFailures ?? DEFAULT_MAX_FAILURES;
    this.windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
    this.lockoutMs = options.lockoutMs ?? DEFAULT_LOCKOUT_MS;
  }

  /**
   * Throws RATE_LIMITED when the key is currently locked out.
   */
  assertAllowed(key: string, now = Date.now()): void {
    const state = this.attempts.get(key);
    if (!state) {
      return;
    }

    if (state.lockedUntil !== null && state.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((state.lockedUntil - now) / 1000);
      throw new AppError(
        ErrorCode.RATE_LIMITED,
        "Too many failed sign-in attempts. Please try again later.",
        429,
        [{ reason: "LOGIN_LOCKED", field: "email" }],
        { retryAfterSeconds },
      );
    }

    if (state.lockedUntil !== null && state.lockedUntil <= now) {
      this.attempts.delete(key);
    }
  }

  /**
   * Records a failed login and may lock the key.
   */
  recordFailure(key: string, now = Date.now()): void {
    const existing = this.attempts.get(key);

    if (!existing || now - existing.windowStartedAt > this.windowMs) {
      this.attempts.set(key, {
        failures: 1,
        windowStartedAt: now,
        lockedUntil: null,
      });
      return;
    }

    const failures = existing.failures + 1;
    const lockedUntil =
      failures >= this.maxFailures ? now + this.lockoutMs : null;

    this.attempts.set(key, {
      failures,
      windowStartedAt: existing.windowStartedAt,
      lockedUntil,
    });
  }

  /**
   * Clears failures after a successful login.
   */
  recordSuccess(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Test helper — current failure count for a key.
   */
  getFailureCount(key: string, now = Date.now()): number {
    const state = this.attempts.get(key);
    if (!state) {
      return 0;
    }
    if (state.lockedUntil !== null && state.lockedUntil <= now) {
      return 0;
    }
    if (now - state.windowStartedAt > this.windowMs && state.lockedUntil === null) {
      return 0;
    }
    return state.failures;
  }

  /**
   * Test helper — wipe all state.
   */
  clear(): void {
    this.attempts.clear();
  }
}

/** Shared process-wide login throttle (email + IP composite keys). */
export const loginThrottle = new LoginThrottle();

/**
 * Builds a stable throttle key from normalized email and client IP.
 */
export const loginThrottleKey = (email: string, ip: string): string =>
  `${email.trim().toLowerCase()}|${ip}`;
