"use client";

import { CircleAlertIcon, CircleHelpIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/reui/badge";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { AttentionItem } from "@/lib/applications/attention";
import {
  pipelineBadgeVariant,
  statusLabel,
} from "@/lib/applications/status";
import { cn } from "@/lib/utils";

type NeedsAttentionFrameProps = {
  readonly items: readonly AttentionItem[];
  readonly isLoading: boolean;
};

const ATTENTION_RULES = [
  { title: "Quiet interview", detail: "No update for 7+ days" },
  { title: "Stale applied", detail: "No update for 14+ days" },
  { title: "Missing applied date", detail: "Status is Applied" },
  { title: "Missing role notes", detail: "Active roles only" },
] as const;

/**
 * Overview panel for applications that likely need a follow-up.
 */
export const NeedsAttentionFrame = ({
  items,
  isLoading,
}: NeedsAttentionFrameProps) => {
  return (
    <Frame className="min-w-0" spacing="sm">
      <FramePanel fit className="py-2.5">
        <div className="flex items-center justify-between gap-3">
          <FrameHeader className="min-w-0 px-0 py-0">
            <div className="flex items-center gap-1">
              <FrameTitle>Needs attention</FrameTitle>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="size-6 text-muted-foreground"
                      aria-label="How needs attention works"
                    />
                  }
                >
                  <CircleHelpIcon className="size-3.5" aria-hidden="true" />
                </PopoverTrigger>
                <PopoverContent align="start" side="bottom" className="w-72 p-3">
                  <PopoverHeader className="gap-1">
                    <PopoverTitle>How this list works</PopoverTitle>
                    <PopoverDescription className="text-xs leading-relaxed">
                      Active roles are flagged when something looks overdue or
                      incomplete.
                    </PopoverDescription>
                  </PopoverHeader>
                  <Separator />
                  <ul className="flex flex-col gap-2.5">
                    {ATTENTION_RULES.map((rule) => (
                      <li key={rule.title} className="min-w-0">
                        <p className="text-sm font-medium leading-none">
                          {rule.title}
                        </p>
                        <p className="mt-1 text-xs leading-snug text-muted-foreground">
                          {rule.detail}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <Separator />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Rejected and withdrawn roles are never included.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <FrameDescription className="text-xs">
              Roles that may need a follow-up or missing details.
            </FrameDescription>
          </FrameHeader>
          {!isLoading && items.length > 0 ? (
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {items.length}
            </span>
          ) : null}
        </div>
      </FramePanel>

      <FramePanel className="p-0">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Empty className="border-0 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleAlertIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>All clear</EmptyTitle>
              <EmptyDescription>
                No stale or incomplete active roles right now.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={`${item.application.id}-${item.reason}`}>
                <Link
                  href={`/dashboard/applications/${item.application.id}`}
                  className={cn(
                    "flex items-start justify-between gap-3 px-4 py-3 transition-colors",
                    "hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none",
                  )}
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium">
                      {item.application.jobTitle}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.application.companyName} · {item.label}
                    </p>
                  </div>
                  <Badge
                    variant={pipelineBadgeVariant(item.application.status)}
                    radius="full"
                    className="shrink-0"
                  >
                    {statusLabel[item.application.status]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </FramePanel>

      {!isLoading && items.length > 0 ? (
        <FramePanel fit className="py-2">
          <Link
            href="/dashboard/applications"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-full justify-center",
            )}
          >
            Open applications
          </Link>
        </FramePanel>
      ) : null}
    </Frame>
  );
};
