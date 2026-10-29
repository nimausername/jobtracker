"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  loginRequest,
  logoutRequest,
  meRequest,
  refreshRequest,
  registerRequest,
} from "@/lib/api/auth";
import { ApiError, setAuthSessionHandlers } from "@/lib/api/client";
import type { AuthSession, AuthUser } from "@/lib/api/types";

/** Fallback when access lifetime is unknown (Keycloak default is often 300s). */
const DEFAULT_ACCESS_TTL_SECONDS = 300;

/** Refresh slightly before access token expiry. */
const REFRESH_RATIO = 0.8;

type AuthContextValue = {
  readonly user: AuthUser | null;
  readonly isLoading: boolean;
  readonly login: (
    email: string,
    password: string,
    options?: { readonly turnstileToken?: string },
  ) => Promise<void>;
  readonly register: (
    email: string,
    password: string,
    options: {
      readonly firstName: string;
      readonly lastName: string;
      readonly acceptedLegal: true;
      readonly documentsVersion: string;
      readonly turnstileToken?: string;
    },
  ) => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  readonly children: ReactNode;
};

/**
 * Schedules the next proactive token refresh from access-token lifetime.
 */
const getRefreshDelayMs = (expiresInSeconds: number): number => {
  const ttl = Math.max(expiresInSeconds, 30);
  return Math.max(Math.floor(ttl * REFRESH_RATIO * 1000), 5_000);
};

/**
 * Provides session state for cookie-backed in-app auth.
 * Keeps the session alive with proactive refresh while the tab is open.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);
  const isBootstrappedRef = useRef(false);
  const userRef = useRef<AuthUser | null>(null);

  userRef.current = user;

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const handleSessionExpired = useCallback(() => {
    clearRefreshTimer();
    userRef.current = null;
    setUser(null);
  }, [clearRefreshTimer]);

  const scheduleRefreshRef = useRef<(expiresInSeconds: number) => void>(
    () => undefined,
  );

  const scheduleRefresh = useCallback(
    (expiresInSeconds: number) => {
      clearRefreshTimer();
      refreshTimerRef.current = setTimeout(() => {
        void (async () => {
          if (!userRef.current || isRefreshingRef.current) {
            return;
          }
          isRefreshingRef.current = true;
          try {
            const session = await refreshRequest();
            // Failure here is not logout: access may still be valid.
            // Retry later; apiRequest clears auth only after 401 + failed refresh.
            if (!session && userRef.current) {
              scheduleRefreshRef.current(DEFAULT_ACCESS_TTL_SECONDS);
            }
          } finally {
            isRefreshingRef.current = false;
          }
        })();
      }, getRefreshDelayMs(expiresInSeconds));
    },
    [clearRefreshTimer],
  );

  scheduleRefreshRef.current = scheduleRefresh;

  const handleSessionRefreshed = useCallback(
    (session: AuthSession) => {
      scheduleRefresh(session.expiresIn);
    },
    [scheduleRefresh],
  );

  useEffect(() => {
    setAuthSessionHandlers({
      onRefreshed: handleSessionRefreshed,
      onExpired: handleSessionExpired,
    });

    return () => {
      setAuthSessionHandlers({});
      clearRefreshTimer();
    };
  }, [clearRefreshTimer, handleSessionExpired, handleSessionRefreshed]);

  const refreshUser = useCallback(async () => {
    const profile = await meRequest();
    setUser(profile);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const profile = await meRequest();
        if (cancelled) {
          return;
        }
        setUser(profile);
        // Do not refresh immediately on load — that raced Keycloak rotation
        // and logged users out after hard refresh. Schedule a later refresh.
        scheduleRefresh(DEFAULT_ACCESS_TTL_SECONDS);
      } catch (error) {
        if (cancelled) {
          return;
        }
        const isUnauthorized =
          error instanceof ApiError && error.status === 401;
        // Definitive auth failure stays logged out. Transient me/refresh
        // failures get one recovery attempt so a remount does not force login.
        if (isUnauthorized) {
          setUser(null);
        } else {
          const session = await refreshRequest();
          if (cancelled) {
            return;
          }
          if (session) {
            try {
              const profile = await meRequest();
              if (!cancelled) {
                setUser(profile);
                scheduleRefresh(session.expiresIn);
              }
              return;
            } catch {
              // Fall through to logged-out state.
            }
          }
          if (!cancelled) {
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) {
          isBootstrappedRef.current = true;
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [scheduleRefresh]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible" || !userRef.current) {
        return;
      }
      if (!isBootstrappedRef.current || isRefreshingRef.current) {
        return;
      }

      // Soft refresh only: never treat failure as logout while access may work.
      isRefreshingRef.current = true;
      void (async () => {
        try {
          const session = await refreshRequest();
          if (!session && userRef.current) {
            scheduleRefresh(DEFAULT_ACCESS_TTL_SECONDS);
          }
        } finally {
          isRefreshingRef.current = false;
        }
      })();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [scheduleRefresh]);

  const login = useCallback(
    async (
      email: string,
      password: string,
      options?: { readonly turnstileToken?: string },
    ) => {
      const session = await loginRequest({
        email,
        password,
        ...(options?.turnstileToken
          ? { turnstileToken: options.turnstileToken }
          : {}),
      });
      const profile = await meRequest();
      setUser(profile);
      scheduleRefresh(session.expiresIn);
    },
    [scheduleRefresh],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      options: {
        readonly firstName: string;
        readonly lastName: string;
        readonly acceptedLegal: true;
        readonly documentsVersion: string;
        readonly turnstileToken?: string;
      },
    ) => {
      await registerRequest({
        email,
        password,
        firstName: options.firstName,
        lastName: options.lastName,
        acceptedLegal: options.acceptedLegal,
        documentsVersion: options.documentsVersion,
        ...(options.turnstileToken
          ? { turnstileToken: options.turnstileToken }
          : {}),
      });
    },
    [],
  );

  const logout = useCallback(async () => {
    clearRefreshTimer();
    try {
      await logoutRequest();
    } catch {
      // Local session clear still proceeds if the API is unreachable.
    }
    setUser(null);
  }, [clearRefreshTimer]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Accesses auth context; throws outside the provider.
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
