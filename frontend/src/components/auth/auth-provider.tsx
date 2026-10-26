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

import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
} from "@/lib/api/auth";
import type { AuthUser } from "@/lib/api/types";

type AuthContextValue = {
  readonly user: AuthUser | null;
  readonly isLoading: boolean;
  readonly login: (email: string, password: string) => Promise<void>;
  readonly register: (
    email: string,
    password: string,
    options: {
      readonly name?: string;
      readonly acceptedLegal: true;
      readonly documentsVersion: string;
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
 * Provides session state for cookie-backed in-app auth.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const profile = await meRequest();
    setUser(profile);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const profile = await meRequest();
        if (!cancelled) {
          setUser(profile);
        }
      } catch {
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
    await loginRequest({ email, password });
    const profile = await meRequest();
    setUser(profile);
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      options: {
        readonly name?: string;
        readonly acceptedLegal: true;
        readonly documentsVersion: string;
      },
    ) => {
      await registerRequest({
        email,
        password,
        acceptedLegal: options.acceptedLegal,
        documentsVersion: options.documentsVersion,
        ...(options.name ? { name: options.name } : {}),
      });
      const profile = await meRequest();
      setUser(profile);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Local session clear still proceeds if the API is unreachable.
    }
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
