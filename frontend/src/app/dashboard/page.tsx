"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ApplicationFormSheet } from "@/components/applications/application-form-sheet";
import { NeedsAttentionFrame } from "@/components/dashboard/needs-attention-frame";
import { OverviewKpiRow } from "@/components/dashboard/overview-kpi-row";
import { RecentApplicationsFrame } from "@/components/dashboard/recent-applications-frame";
import { Button } from "@/components/ui/button";
import {
  createApplication,
  getApplicationsSummary,
  listApplications,
  type Application,
  type ApplicationInput,
  type ApplicationSummary,
} from "@/lib/api/applications";
import { getAttentionItems } from "@/lib/applications/attention";

/**
 * Dashboard overview — KPIs, needs attention, and recent activity.
 */
const DashboardPage = () => {
  const [summary, setSummary] = useState<ApplicationSummary | null>(null);
  const [pipeline, setPipeline] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [summaryData, pipelineData] = await Promise.all([
        getApplicationsSummary(),
        listApplications({ limit: 50, sort: "updatedAt" }),
      ]);
      setSummary(summaryData);
      setPipeline(pipelineData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load overview");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const recent = useMemo(() => pipeline.slice(0, 5), [pipeline]);

  const attentionItems = useMemo(
    () => getAttentionItems(pipeline).slice(0, 6),
    [pipeline],
  );

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
            What needs attention next in your search.
          </p>
        </div>
        <Button size="sm" type="button" onClick={handleAddApplication}>
          Add application
        </Button>
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

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <NeedsAttentionFrame items={attentionItems} isLoading={isLoading} />
        <RecentApplicationsFrame
          applications={recent}
          isLoading={isLoading}
          isEmpty={!isLoading && (summary?.total ?? 0) === 0}
          onAddApplication={handleAddApplication}
        />
      </div>

      <ApplicationFormSheet
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default DashboardPage;
