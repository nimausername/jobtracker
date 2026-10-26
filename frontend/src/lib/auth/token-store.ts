const ACCESS_KEY = "jobtracker.accessToken";
const REFRESH_KEY = "jobtracker.refreshToken";

/**
 * Persists auth tokens in localStorage (MVP). Prefer httpOnly cookies later.
 */
export const tokenStore = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(ACCESS_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(REFRESH_KEY);
  },

  setTokens(accessToken: string, refreshToken: string): void {
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },

  clear(): void {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};
