"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/components/auth/auth-provider";

type RequireGuestProps = {
  readonly children: ReactNode;
};

/**
 * Redirects authenticated users away from public auth/marketing pages.
 */
export const RequireGuest = ({ children }: RequireGuestProps) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (user) {
    return null;
  }

  return children;
};
