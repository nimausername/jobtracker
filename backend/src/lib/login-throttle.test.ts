import { beforeEach, describe, expect, it } from "vitest";

import { AppError, ErrorCode } from "./errors.js";
import { AttemptThrottle, loginThrottleKey } from "./login-throttle.js";

describe("AttemptThrottle", () => {
  let throttle: AttemptThrottle;

  beforeEach(() => {
    throttle = new AttemptThrottle({
      prefix: "test-login",
      maxFailures: 3,
      windowMs: 60_000,
      lockoutMs: 120_000,
    });
  });

  it("allows attempts before the failure limit", async () => {
    const key = loginThrottleKey("user@example.com", "1.2.3.4");
    await expect(throttle.assertAllowed(key)).resolves.toBeUndefined();
    await throttle.recordFailure(key);
    await throttle.recordFailure(key);
    await expect(throttle.getFailureCount(key)).resolves.toBe(2);
    await expect(throttle.assertAllowed(key)).resolves.toBeUndefined();
  });

  it("locks after max failures and unlocks after lockout", async () => {
    const key = loginThrottleKey("user@example.com", "1.2.3.4");
    const t0 = 1_000_000;

    await throttle.recordFailure(key, t0);
    await throttle.recordFailure(key, t0 + 1);
    await throttle.recordFailure(key, t0 + 2);

    await expect(throttle.assertAllowed(key, t0 + 3)).rejects.toBeInstanceOf(
      AppError,
    );

    try {
      await throttle.assertAllowed(key, t0 + 3);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe(ErrorCode.RATE_LIMITED);
      expect((error as AppError).statusCode).toBe(429);
      expect((error as AppError).retryAfterSeconds).toBeGreaterThan(0);
    }

    await expect(
      throttle.assertAllowed(key, t0 + 122_000),
    ).resolves.toBeUndefined();
  });

  it("clears failures on success", async () => {
    const key = loginThrottleKey("user@example.com", "1.2.3.4");
    await throttle.recordFailure(key);
    await throttle.recordFailure(key);
    await throttle.recordSuccess(key);
    await expect(throttle.getFailureCount(key)).resolves.toBe(0);
  });

  it("isolates keys by email and IP", async () => {
    const a = loginThrottleKey("a@example.com", "1.1.1.1");
    const b = loginThrottleKey("a@example.com", "2.2.2.2");
    await throttle.recordFailure(a);
    await throttle.recordFailure(a);
    await throttle.recordFailure(a);
    await expect(throttle.assertAllowed(a)).rejects.toBeInstanceOf(AppError);
    await expect(throttle.assertAllowed(b)).resolves.toBeUndefined();
  });
});
