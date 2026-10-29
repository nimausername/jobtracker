"use client";

import {
  CheckCircle2Icon,
  CircleDotIcon,
  MoreHorizontalIcon,
  NotebookPenIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { NoteBody } from "@/components/applications/note-body";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/reui/timeline";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ApplicationNote } from "@/lib/api/notes";
import { statusLabel } from "@/lib/applications/status";
import { cn } from "@/lib/utils";

type ApplicationActivityTimelineProps = {
  readonly activities: ApplicationNote[];
  readonly onEditNote: (activity: ApplicationNote) => void;
  readonly onDeleteNote: (activity: ApplicationNote) => void;
  readonly onAddUpdate?: () => void;
};

const formatDateTime = (iso: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

const activityTitle = (activity: ApplicationNote): string => {
  switch (activity.kind) {
    case "created":
      return "Added to tracker";
    case "status_change":
      if (activity.fromStatus && activity.toStatus) {
        return `${statusLabel[activity.fromStatus]} → ${statusLabel[activity.toStatus]}`;
      }
      if (activity.toStatus) {
        return `Status · ${statusLabel[activity.toStatus]}`;
      }
      return "Status updated";
    default:
      return "Note";
  }
};

const activityIcon = (kind: ApplicationNote["kind"]) => {
  switch (kind) {
    case "created":
      return CheckCircle2Icon;
    case "status_change":
      return CircleDotIcon;
    default:
      return NotebookPenIcon;
  }
};

/**
 * Activity timeline that grows with content, then scrolls inside a max height.
 */
export const ApplicationActivityTimeline = ({
  activities,
  onEditNote,
  onDeleteNote,
  onAddUpdate,
}: ApplicationActivityTimelineProps) => {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 py-3">
        <p className="text-sm text-muted-foreground">
          No activity yet. Log the first update to start the history.
        </p>
        {onAddUpdate ? (
          <Button type="button" size="sm" onClick={onAddUpdate}>
            Add update
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[min(28rem,calc(100dvh-26rem))] pr-3">
      <Timeline
        className="px-1"
        defaultValue={activities.length}
        value={activities.length}
      >
        {activities.map((activity, index) => {
          const step = index + 1;
          const Icon = activityIcon(activity.kind);

          return (
            <TimelineItem
              key={activity.id}
              step={step}
              className="group-data-[orientation=vertical]/ms-8 group-data-[orientation=vertical]/pb-4"
            >
              <TimelineHeader>
                <TimelineSeparator className="group-data-[orientation=vertical]/h-[calc(100%-1.25rem)] group-data-[orientation=vertical]/translate-y-5" />
                <TimelineDate className="mb-0.5">
                  {formatDateTime(activity.createdAt)}
                </TimelineDate>
                <div className="flex items-start justify-between gap-2">
                  <TimelineTitle className="text-sm">
                    {activityTitle(activity)}
                  </TimelineTitle>
                  {activity.deletable ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            className="-mt-1 shrink-0 opacity-70 transition-opacity hover:opacity-100"
                            aria-label="Note actions"
                          />
                        }
                      >
                        <MoreHorizontalIcon aria-hidden="true" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => onEditNote(activity)}
                          >
                            <PencilIcon aria-hidden="true" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDeleteNote(activity)}
                          >
                            <Trash2Icon aria-hidden="true" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
                <TimelineIndicator
                  className={cn(
                    "flex size-6 items-center justify-center border-none",
                    activity.kind === "status_change" && "bg-info/15 text-info",
                    activity.kind === "created" &&
                      "bg-success/15 text-success",
                    activity.kind === "note" && "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </TimelineIndicator>
              </TimelineHeader>
              <TimelineContent>
                <NoteBody body={activity.body} />
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </ScrollArea>
  );
};
