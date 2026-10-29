"use client";

import Link from "next/link";

import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ApplicationStatus,
  ApplicationSummary,
} from "@/lib/api/applications";
import {
  statusIndicatorClass,
  statusLabel,
  statusToneClass,
} from "@/lib/applications/status";
import { cn } from "@/lib/utils";

type OverviewKpiRowProps = {
  readonly summary: ApplicationSummary | null;
  readonly isLoading: boolean;
};

type KpiTone = ApplicationStatus | "total" | "closed";

type KpiItem = {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly href: string;
  readonly tone: KpiTone;
};

const ACTIVE_STATUS_KPIS = [
  "wishlist",
  "applied",
  "interview",
  "offer",
] as const satisfies readonly ApplicationStatus[];

const kpiIndicatorClass: Record<KpiTone, string> = {
  total: "bg-foreground/70",
  closed: statusIndicatorClass.rejected,
  wishlist: statusIndicatorClass.wishlist,
  applied: statusIndicatorClass.applied,
  interview: statusIndicatorClass.interview,
  offer: statusIndicatorClass.offer,
  rejected: statusIndicatorClass.rejected,
  withdrawn: statusIndicatorClass.withdrawn,
};

const kpiValueClass: Record<KpiTone, string> = {
  total: "text-foreground",
  closed: statusToneClass.rejected,
  wishlist: statusToneClass.wishlist,
  applied: statusToneClass.applied,
  interview: statusToneClass.interview,
  offer: statusToneClass.offer,
  rejected: statusToneClass.rejected,
  withdrawn: statusToneClass.withdrawn,
};

/**
 * Pipeline KPI row as FramePanels — ReUI dashboard grid house pattern.
 */
export const OverviewKpiRow = ({ summary, isLoading }: OverviewKpiRowProps) => {
  const closedCount =
    (summary?.byStatus.rejected ?? 0) + (summary?.byStatus.withdrawn ?? 0);

  const items: KpiItem[] = [
    {
      key: "total",
      label: "Total",
      value: summary?.total ?? 0,
      href: "/dashboard/applications",
      tone: "total",
    },
    ...ACTIVE_STATUS_KPIS.map((status) => ({
      key: status,
      label: statusLabel[status],
      value: summary?.byStatus[status] ?? 0,
      href: `/dashboard/applications?status=${status}`,
      tone: status,
    })),
    {
      key: "closed",
      label: "Closed",
      value: closedCount,
      href: "/dashboard/applications",
      tone: "closed",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => (
        <Frame key={item.key} spacing="sm" className="min-w-0">
          <FramePanel className="transition-colors hover:bg-muted/40">
            <Link
              href={item.href}
              className="block outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${item.label}: ${item.value}. Open filtered applications.`}
            >
              <FrameHeader>
                <FrameDescription className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      kpiIndicatorClass[item.tone],
                    )}
                  />
                  {item.label}
                </FrameDescription>
                <FrameTitle
                  className={cn(
                    "text-2xl font-semibold tracking-tight tabular-nums",
                    !isLoading && kpiValueClass[item.tone],
                  )}
                >
                  {isLoading ? <Skeleton className="h-8 w-12" /> : item.value}
                </FrameTitle>
              </FrameHeader>
            </Link>
          </FramePanel>
        </Frame>
      ))}
    </div>
  );
};
