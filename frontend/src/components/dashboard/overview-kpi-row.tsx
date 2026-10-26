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
import { statusLabel } from "@/lib/applications/status";

type OverviewKpiRowProps = {
  readonly summary: ApplicationSummary | null;
  readonly isLoading: boolean;
};

type KpiItem = {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly href: string;
};

const STATUS_KPIS = [
  "wishlist",
  "applied",
  "interview",
  "offer",
] as const satisfies readonly ApplicationStatus[];

/**
 * Pipeline KPI row as FramePanels — ReUI dashboard grid house pattern.
 */
export const OverviewKpiRow = ({ summary, isLoading }: OverviewKpiRowProps) => {
  const items: KpiItem[] = [
    {
      key: "total",
      label: "Total",
      value: summary?.total ?? 0,
      href: "/dashboard/applications",
    },
    ...STATUS_KPIS.map((status) => ({
      key: status,
      label: statusLabel[status],
      value: summary?.byStatus[status] ?? 0,
      href: `/dashboard/applications?status=${status}`,
    })),
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <Frame key={item.key} spacing="sm" className="min-w-0">
          <FramePanel className="transition-colors hover:bg-muted/40">
            <Link
              href={item.href}
              className="block outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${item.label}: ${item.value}. Open filtered applications.`}
            >
              <FrameHeader>
                <FrameDescription>{item.label}</FrameDescription>
                <FrameTitle className="text-2xl font-semibold tracking-tight tabular-nums">
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
