import {
  AttemptThrottle,
  emailIpThrottleKey,
} from "./attempt-throttle.js";
import type { RedisClient } from "./redis.js";

/**
 * Shared login throttle (email + IP). Wired with Redis in `buildApp` when available.
 */
export let loginThrottle = new AttemptThrottle({ prefix: "login" });

/**
 * Forgot-password throttle (email). Wired with Redis in `buildApp` when available.
 */
export let forgotPasswordThrottle = new AttemptThrottle({
  prefix: "forgot-password",
  maxFailures: 5,
  windowMs: 60 * 60 * 1000,
  lockoutMs: 60 * 60 * 1000,
});

/**
 * Rebinds shared throttles to Redis-backed instances.
 */
export const configureAuthThrottles = (redis: RedisClient | null): void => {
  loginThrottle = new AttemptThrottle({ prefix: "login", redis });
  forgotPasswordThrottle = new AttemptThrottle({
    prefix: "forgot-password",
    maxFailures: 5,
    windowMs: 60 * 60 * 1000,
    lockoutMs: 60 * 60 * 1000,
    redis,
  });
};

export const loginThrottleKey = emailIpThrottleKey;
export { AttemptThrottle };
