import { beforeEach, describe, expect, it } from "vitest";

import { AppError, ErrorCode } from "./errors.js";
import { LoginThrottle, loginThrottleKey } from "./login-throttle.js";

describe("LoginThrottle", () => {
  let throttle: LoginThrottle;

  beforeEach(() => {
    throttle = new LoginThrottle({
      maxFailures: 3,
      windowMs: 60_000,
      lockoutMs: 120_000,
    });
  });

  it("allows attempts before the failure limit", () => {
    const key = loginThrottleKey("user@example.com", "1.2.3.4");
    expect(() => throttle.assertAllowed(key)).not.toThrow();
    throttle.recordFailure(key);
    throttle.recordFailure(key);
    expect(throttle.getFailureCount(key)).toBe(2);
    expect(() => throttle.assertAllowed(key)).not.toThrow();
  });

  it("locks after max failures and unlocks after lockout", () => {
    const key = loginThrottleKey("user@example.com", "1.2.3.4");
    const t0 = 1_000_000;

    throttle.recordFailure(key, t0);
    throttle.recordFailure(key, t0 + 1);
    throttle.recordFailure(key, t0 + 2);

    expect(() => throttle.assertAllowed(key, t0 + 3)).toThrow(AppError);

    try {
      throttle.assertAllowed(key, t0 + 3);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe(ErrorCode.RATE_LIMITED);
      expect((error as AppError).statusCode).toBe(429);
      expect((error as AppError).retryAfterSeconds).toBeGreaterThan(0);
    }

    // Lock started at t0+2 with lockoutMs=120_000 → expires at t0+120_002.
    expect(() =>
      throttle.assertAllowed(key, t0 + 122_000),
    ).not.toThrow();
  });

  it("clears failures on success", () => {
    const key = loginThrottleKey("user@example.com", "1.2.3.4");
    throttle.recordFailure(key);
    throttle.recordFailure(key);
    throttle.recordSuccess(key);
    expect(throttle.getFailureCount(key)).toBe(0);
  });

  it("isolates keys by email and IP", () => {
    const a = loginThrottleKey("a@example.com", "1.1.1.1");
    const b = loginThrottleKey("a@example.com", "2.2.2.2");
    throttle.recordFailure(a);
    throttle.recordFailure(a);
    throttle.recordFailure(a);
    expect(() => throttle.assertAllowed(a)).toThrow();
    expect(() => throttle.assertAllowed(b)).not.toThrow();
  });
});
