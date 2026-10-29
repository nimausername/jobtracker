"use client";

import {
  MoreHorizontalIcon,
  NotebookPenIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { NoteBody } from "@/components/applications/note-body";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ApplicationRoleNotesProps = {
  readonly notes: string | null;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
};

/**
 * Application-level role notes panel (rich body, edit/delete — not timeline).
 */
export const ApplicationRoleNotes = ({
  notes,
  onEdit,
  onDelete,
}: ApplicationRoleNotesProps) => {
  const hasNotes = Boolean(notes?.trim());

  return (
    <Frame className="min-w-0" spacing="sm">
      <FramePanel fit className="py-2">
        <FrameHeader className="flex-row items-center justify-between gap-2 px-0 py-0">
          <FrameTitle className="inline-flex items-center gap-1.5">
            <NotebookPenIcon
              className="size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
            Role notes
          </FrameTitle>
          {hasNotes ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
                    aria-label="Role notes actions"
                  />
                }
              >
                <MoreHorizontalIcon aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={onEdit}>
                    <PencilIcon aria-hidden="true" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={onDelete}>
                    <Trash2Icon aria-hidden="true" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </FrameHeader>
      </FramePanel>
      <FramePanel>
        {hasNotes && notes ? (
          <NoteBody body={notes} clampLines={3} />
        ) : (
          <p className="py-1 text-sm text-muted-foreground">
            Capture salary, referrals, and role context here. Timeline updates
            stay in Activity.
          </p>
        )}
      </FramePanel>
    </Frame>
  );
};
