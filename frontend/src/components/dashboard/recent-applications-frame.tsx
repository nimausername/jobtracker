"use client";

import { BriefcaseBusinessIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/reui/badge";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Application } from "@/lib/api/applications";
import {
  pipelineBadgeVariant,
  statusLabel,
} from "@/lib/applications/status";
import { cn } from "@/lib/utils";

type RecentApplicationsFrameProps = {
  readonly applications: Application[];
  readonly isLoading: boolean;
  readonly isEmpty: boolean;
  readonly onAddApplication: () => void;
};

const formatUpdatedAt = (iso: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(iso));

/**
 * Recent applications Frame with table, empty, and loading states.
 */
export const RecentApplicationsFrame = ({
  applications,
  isLoading,
  isEmpty,
  onAddApplication,
}: RecentApplicationsFrameProps) => {
  return (
    <Frame className="min-w-0" spacing="sm">
      <FramePanel fit className="py-2.5">
        <div className="flex items-center justify-between gap-3">
          <FrameHeader className="min-w-0 px-0 py-0">
            <FrameTitle>Recent</FrameTitle>
            <FrameDescription className="text-xs">
              Latest updates across your pipeline.
            </FrameDescription>
          </FrameHeader>
          {!isEmpty ? (
            <Link
              href="/dashboard/applications"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "shrink-0",
              )}
            >
              View all
            </Link>
          ) : null}
        </div>
      </FramePanel>

      <FramePanel className="p-0">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : isEmpty ? (
          <Empty className="border-0 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BriefcaseBusinessIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No applications yet</EmptyTitle>
              <EmptyDescription>
                Add your first role to start tracking the pipeline.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <button
                type="button"
                className={cn(buttonVariants({ size: "sm" }))}
                onClick={onAddApplication}
              >
                Add application
              </button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/applications/${item.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {item.companyName}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[14rem] truncate text-muted-foreground">
                      {item.jobTitle}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={pipelineBadgeVariant(item.status)}
                        radius="full"
                      >
                        {statusLabel[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatUpdatedAt(item.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </FramePanel>
    </Frame>
  );
};
