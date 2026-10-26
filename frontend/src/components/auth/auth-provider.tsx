"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { loginRequest, meRequest, registerRequest } from "@/lib/api/auth";
import type { AuthUser } from "@/lib/api/types";
import { tokenStore } from "@/lib/auth/token-store";

type AuthContextValue = {
  readonly user: AuthUser | null;
  readonly isLoading: boolean;
  readonly login: (email: string, password: string) => Promise<void>;
  readonly register: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<void>;
  readonly logout: () => void;
  readonly refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  readonly children: ReactNode;
};

/**
 * Provides session state for in-app auth.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const accessToken = tokenStore.getAccessToken();
    if (!accessToken) {
      setUser(null);
      return;
    }

    const profile = await meRequest();
    setUser(profile);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        if (!tokenStore.getAccessToken()) {
          if (!cancelled) {
            setUser(null);
          }
          return;
        }
        const profile = await meRequest();
        if (!cancelled) {
          setUser(profile);
        }
      } catch {
        tokenStore.clear();
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await loginRequest({ email, password });
    tokenStore.setTokens(tokens.accessToken, tokens.refreshToken);
    const profile = await meRequest();
    setUser(profile);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const tokens = await registerRequest({
        email,
        password,
        ...(name ? { name } : {}),
      });
      tokenStore.setTokens(tokens.accessToken, tokens.refreshToken);
      const profile = await meRequest();
      setUser(profile);
    },
    [],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

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
