"use client";

import {
  ArrowLeftIcon,
  ChevronDownIcon,
  NotebookPenIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ApplicationActivityTimeline } from "@/components/applications/application-activity-timeline";
import { ApplicationFormSheet } from "@/components/applications/application-form-sheet";
import { ApplicationNoteEditSheet } from "@/components/applications/application-note-edit-sheet";
import { ApplicationRoleMeta } from "@/components/applications/application-role-meta";
import { ApplicationRoleNotes } from "@/components/applications/application-role-notes";
import { ApplicationRoleNotesSheet } from "@/components/applications/application-role-notes-sheet";
import { ApplicationStatusSelect } from "@/components/applications/application-status-select";
import {
  ApplicationUpdateSheet,
  type ApplicationUpdatePayload,
} from "@/components/applications/application-update-sheet";
import { ConfirmDeleteDialog } from "@/components/applications/confirm-delete-dialog";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteApplication,
  getApplication,
  updateApplication,
  updateApplicationStatus,
  type Application,
  type ApplicationInput,
  type ApplicationStatus,
} from "@/lib/api/applications";
import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
  type ApplicationNote,
} from "@/lib/api/notes";
import { statusLabel } from "@/lib/applications/status";
import { cn } from "@/lib/utils";

type ApplicationDetailProps = {
  readonly applicationId: string;
};

/**
 * Application detail: role meta, read-only timeline, updates via sheet.
 */
export const ApplicationDetail = ({
  applicationId,
}: ApplicationDetailProps) => {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [activities, setActivities] = useState<ApplicationNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [roleNotesOpen, setRoleNotesOpen] = useState(false);
  const [deleteApplicationOpen, setDeleteApplicationOpen] = useState(false);
  const [deleteRoleNotesOpen, setDeleteRoleNotesOpen] = useState(false);
  const [pendingNoteDelete, setPendingNoteDelete] =
    useState<ApplicationNote | null>(null);
  const [editingNote, setEditingNote] = useState<ApplicationNote | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [app, timeline] = await Promise.all([
        getApplication(applicationId),
        listNotes(applicationId),
      ]);
      setApplication(app);
      setActivities(timeline);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  const reloadActivities = useCallback(async () => {
    const timeline = await listNotes(applicationId);
    setActivities(timeline);
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpdate = async (input: ApplicationInput) => {
    const updated = await updateApplication(applicationId, input);
    setApplication(updated);
    await reloadActivities();
    toast.success("Application updated");
  };

  const handleStatusChange = async (nextStatus: ApplicationStatus) => {
    if (!application || nextStatus === application.status) {
      return;
    }

    const previous = application;
    setIsUpdatingStatus(true);
    setApplication({ ...application, status: nextStatus });

    try {
      const updated = await updateApplicationStatus(
        applicationId,
        nextStatus,
      );
      setApplication(updated);
      await reloadActivities();
      toast.success(`Moved to ${statusLabel[updated.status]}`);
    } catch (err) {
      setApplication(previous);
      toast.error(
        err instanceof Error ? err.message : "Could not update status",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmDeleteApplication = async () => {
    try {
      await deleteApplication(applicationId);
      toast.success("Application deleted");
      router.replace("/dashboard/applications");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      throw err;
    }
  };

  const handleSheetSubmit = async (payload: ApplicationUpdatePayload) => {
    try {
      if (payload.status) {
        const updated = await updateApplicationStatus(
          applicationId,
          payload.status,
        );
        setApplication(updated);
      }

      if (payload.body) {
        const note = await createNote(applicationId, payload.body);
        setActivities((prev) => [note, ...prev]);
      }

      if (payload.status) {
        await reloadActivities();
      }

      if (payload.status && payload.body) {
        toast.success("Update saved");
      } else if (payload.status) {
        toast.success(`Moved to ${statusLabel[payload.status]}`);
      } else {
        toast.success("Note added");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save update");
      throw err;
    }
  };

  const handleEditNoteSubmit = async (body: string) => {
    if (!editingNote) {
      return;
    }

    try {
      const updated = await updateNote(applicationId, editingNote.id, body);
      setActivities((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success("Note updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update note");
      throw err;
    }
  };

  const handleConfirmDeleteNote = async () => {
    if (!pendingNoteDelete) {
      return;
    }

    try {
      await deleteNote(applicationId, pendingNoteDelete.id);
      setActivities((prev) =>
        prev.filter((item) => item.id !== pendingNoteDelete.id),
      );
      toast.success("Note deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete note");
      throw err;
    }
  };

  const handleRoleNotesSubmit = async (body: string) => {
    try {
      const updated = await updateApplication(applicationId, { notes: body });
      setApplication(updated);
      toast.success("Role notes saved");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save role notes",
      );
      throw err;
    }
  };

  const handleConfirmDeleteRoleNotes = async () => {
    try {
      const updated = await updateApplication(applicationId, { notes: "" });
      setApplication(updated);
      toast.success("Role notes deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete role notes",
      );
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-8 w-72 max-w-full" />
            <div className="flex items-center gap-2 pt-0.5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="size-1 rounded-full" />
              <Skeleton className="h-7 w-28" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-28" />
            <div className="flex overflow-hidden rounded-lg">
              <Skeleton className="h-7 w-14 rounded-none" />
              <Skeleton className="h-7 w-7 rounded-none" />
            </div>
          </div>
        </div>

        <Frame className="min-w-0" spacing="sm">
          <FramePanel>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="min-w-0 space-y-1.5">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-5 w-28 max-w-full" />
                </div>
              ))}
            </div>
          </FramePanel>
        </Frame>

        <Frame className="min-w-0" spacing="sm">
          <FramePanel fit className="py-2">
            <Skeleton className="h-5 w-28" />
          </FramePanel>
          <FramePanel>
            <Skeleton className="h-4 w-full max-w-md" />
          </FramePanel>
        </Frame>

        <Frame className="min-w-0" spacing="sm">
          <FramePanel fit className="py-2">
            <Skeleton className="h-5 w-24" />
          </FramePanel>
          <FramePanel className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="mt-1 size-6 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </FramePanel>
        </Frame>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive" role="alert">
          {error ?? "Application not found"}
        </p>
        <Link
          href="/dashboard/applications"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to applications
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <Link
            href="/dashboard/applications"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2 w-fit",
            )}
          >
            <ArrowLeftIcon />
            Applications
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {application.jobTitle}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <p className="text-muted-foreground">
                {application.companyName}
              </p>
              <span
                aria-hidden
                className="size-1 shrink-0 rounded-full bg-muted-foreground/40"
              />
              <ApplicationStatusSelect
                value={application.status}
                disabled={isUpdatingStatus}
                size="sm"
                aria-label={`Status for ${application.jobTitle}`}
                onValueChange={(nextStatus) => {
                  void handleStatusChange(nextStatus);
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setUpdateOpen(true)}
            aria-label="Add update"
          >
            <PlusIcon />
            Add update
          </Button>

          <ButtonGroup aria-label="Application actions">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="px-2"
                    aria-label="More actions"
                  />
                }
              >
                <ChevronDownIcon aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setRoleNotesOpen(true)}>
                    <NotebookPenIcon aria-hidden="true" />
                    {application.notes?.trim()
                      ? "Edit role notes"
                      : "Add role notes"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteApplicationOpen(true)}
                  >
                    <Trash2Icon aria-hidden="true" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </div>
      </div>

      <ApplicationRoleMeta application={application} />

      <ApplicationRoleNotes
        notes={application.notes}
        onEdit={() => setRoleNotesOpen(true)}
        onDelete={() => setDeleteRoleNotesOpen(true)}
      />

      <Frame className="min-w-0" spacing="sm">
        <FramePanel fit className="py-2">
          <FrameHeader className="px-0 py-0">
            <FrameTitle>
              Activity
              <span className="ms-1.5 font-normal text-muted-foreground">
                · {activities.length}
              </span>
            </FrameTitle>
          </FrameHeader>
        </FramePanel>
        <FramePanel>
          <ApplicationActivityTimeline
            activities={activities}
            onEditNote={setEditingNote}
            onDeleteNote={setPendingNoteDelete}
            onAddUpdate={() => setUpdateOpen(true)}
          />
        </FramePanel>
      </Frame>

      <ApplicationUpdateSheet
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        currentStatus={application.status}
        jobTitle={application.jobTitle}
        companyName={application.companyName}
        onSubmit={handleSheetSubmit}
      />

      <ApplicationNoteEditSheet
        note={editingNote}
        open={editingNote !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingNote(null);
          }
        }}
        onSubmit={handleEditNoteSubmit}
      />

      <ApplicationRoleNotesSheet
        open={roleNotesOpen}
        onOpenChange={setRoleNotesOpen}
        initialBody={application.notes}
        onSubmit={handleRoleNotesSubmit}
      />

      <ApplicationFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={application}
        onSubmit={handleUpdate}
      />

      <ConfirmDeleteDialog
        open={deleteApplicationOpen}
        onOpenChange={setDeleteApplicationOpen}
        title="Delete application?"
        description={`This permanently removes ${application.jobTitle} at ${application.companyName} and its timeline activity.`}
        onConfirm={handleConfirmDeleteApplication}
      />

      <ConfirmDeleteDialog
        open={deleteRoleNotesOpen}
        onOpenChange={setDeleteRoleNotesOpen}
        title="Delete role notes?"
        description="This permanently removes the role notes for this application. Timeline activity is not affected."
        onConfirm={handleConfirmDeleteRoleNotes}
      />

      <ConfirmDeleteDialog
        open={pendingNoteDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingNoteDelete(null);
          }
        }}
        title="Delete note?"
        description="This permanently removes the note from the activity timeline."
        onConfirm={handleConfirmDeleteNote}
      />
    </div>
  );
};
