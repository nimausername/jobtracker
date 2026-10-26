"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import { OverviewKpiRow } from "@/components/dashboard/overview-kpi-row";
import { RecentApplicationsFrame } from "@/components/dashboard/recent-applications-frame";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  createApplication,
  getApplicationsSummary,
  listApplications,
  type Application,
  type ApplicationInput,
  type ApplicationSummary,
} from "@/lib/api/applications";
import { cn } from "@/lib/utils";

/**
 * Dashboard overview — Frame-led KPI grid + recent applications.
 */
const DashboardPage = () => {
  const [summary, setSummary] = useState<ApplicationSummary | null>(null);
  const [recent, setRecent] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [summaryData, recentData] = await Promise.all([
        getApplicationsSummary(),
        listApplications({ limit: 5 }),
      ]);
      setSummary(summaryData);
      setRecent(recentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load overview");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAddApplication = () => {
    setDialogOpen(true);
  };

  const handleCreate = async (input: ApplicationInput) => {
    await createApplication(input);
    toast.success("Application created");
    setDialogOpen(false);
    await load();
  };

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your job search pipeline at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" type="button" onClick={handleAddApplication}>
            Add application
          </Button>
          <Link
            href="/dashboard/applications"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View all
          </Link>
        </div>
      </div>

      {error ? (
        <div
          className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p className="text-sm text-destructive">{error}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              void load();
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}

      <OverviewKpiRow summary={summary} isLoading={isLoading} />

      <RecentApplicationsFrame
        applications={recent}
        isLoading={isLoading}
        isEmpty={!isLoading && (summary?.total ?? 0) === 0}
        onAddApplication={handleAddApplication}
      />

      <ApplicationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default DashboardPage;
