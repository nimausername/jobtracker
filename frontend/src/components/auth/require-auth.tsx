"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/components/auth/auth-provider";

type RequireAuthProps = {
  readonly children: ReactNode;
};

/**
 * Redirects unauthenticated users to the login page.
 */
export const RequireAuth = ({ children }: RequireAuthProps) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return children;
};
