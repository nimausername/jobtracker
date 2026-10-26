"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getApplicationsSummary,
  type ApplicationSummary,
} from "@/lib/api/applications";
import { statusLabel } from "@/lib/applications/status";
import { cn } from "@/lib/utils";

/**
 * Dashboard overview with pipeline counts.
 */
const DashboardPage = () => {
  const [summary, setSummary] = useState<ApplicationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getApplicationsSummary();
        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your job search pipeline at a glance.
          </p>
        </div>
        <Link
          href="/dashboard/applications"
          className={cn(buttonVariants())}
          aria-label="Go to applications"
        >
          Open applications
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl font-semibold tracking-tight tabular-nums">
              {isLoading ? <Skeleton className="h-8 w-12" /> : (summary?.total ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tracked applications</p>
          </CardContent>
        </Card>

        {(
          [
            "wishlist",
            "applied",
            "interview",
            "offer",
          ] as const
        ).map((status) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardDescription>{statusLabel[status]}</CardDescription>
              <CardTitle className="text-2xl font-semibold tracking-tight tabular-nums">
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  (summary?.byStatus[status] ?? 0)
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">In this stage</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
