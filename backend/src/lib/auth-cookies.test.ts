import { describe, expect, it } from "vitest";

import {
  OFFLINE_REFRESH_COOKIE_MAX_AGE_SECONDS,
  resolveRefreshCookieMaxAge,
} from "./auth-cookies.js";

describe("resolveRefreshCookieMaxAge", () => {
  it("uses Keycloak refresh_expires_in when positive", () => {
    expect(resolveRefreshCookieMaxAge(1800)).toBe(1800);
    expect(resolveRefreshCookieMaxAge(2592000)).toBe(2592000);
  });

  it("falls back for offline tokens with refresh_expires_in 0", () => {
    expect(resolveRefreshCookieMaxAge(0)).toBe(
      OFFLINE_REFRESH_COOKIE_MAX_AGE_SECONDS,
    );
  });

  it("falls back for negative values", () => {
    expect(resolveRefreshCookieMaxAge(-1)).toBe(
      OFFLINE_REFRESH_COOKIE_MAX_AGE_SECONDS,
    );
  });
});
