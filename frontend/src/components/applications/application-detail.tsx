"use client";

import { ArrowLeftIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import { ConfirmDeleteDialog } from "@/components/applications/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteApplication,
  getApplication,
  updateApplication,
  type Application,
  type ApplicationInput,
} from "@/lib/api/applications";
import {
  createNote,
  deleteNote,
  listNotes,
  type ApplicationNote,
} from "@/lib/api/notes";
import { statusBadgeVariant, statusLabel } from "@/lib/applications/status";
import { cn } from "@/lib/utils";

type ApplicationDetailProps = {
  readonly applicationId: string;
};

const formatDateTime = (iso: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

/**
 * Application detail view with editable fields and timeline notes.
 */
export const ApplicationDetail = ({
  applicationId,
}: ApplicationDetailProps) => {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [noteBody, setNoteBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteApplicationOpen, setDeleteApplicationOpen] = useState(false);
  const [pendingNoteDelete, setPendingNoteDelete] =
    useState<ApplicationNote | null>(null);
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
      setNotes(timeline);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpdate = async (input: ApplicationInput) => {
    const updated = await updateApplication(applicationId, input);
    setApplication(updated);
    toast.success("Application updated");
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

  const handleAddNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = noteBody.trim();
    if (!body) {
      return;
    }

    setIsSavingNote(true);
    try {
      const note = await createNote(applicationId, body);
      setNotes((prev) => [note, ...prev]);
      setNoteBody("");
      toast.success("Note added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleConfirmDeleteNote = async () => {
    if (!pendingNoteDelete) {
      return;
    }

    try {
      await deleteNote(applicationId, pendingNoteDelete.id);
      setNotes((prev) =>
        prev.filter((item) => item.id !== pendingNoteDelete.id),
      );
      toast.success("Note deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete note");
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
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

  const location = application.isRemote
    ? "Remote"
    : [application.city, application.country].filter(Boolean).join(", ") ||
      "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
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
            <p className="mt-1 text-muted-foreground">
              {application.companyName}
            </p>
          </div>
          <Badge variant={statusBadgeVariant(application.status)}>
            {statusLabel[application.status]}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteApplicationOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Role information and location</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm font-medium">{location}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Job link</p>
            {application.jobUrl ? (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium underline underline-offset-4"
              >
                Open posting
              </a>
            ) : (
              <p className="text-sm font-medium">—</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Notes</p>
            <p className="text-sm whitespace-pre-wrap">
              {application.notes?.trim() || "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>
            Follow-ups, calls, and status updates for this role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-3" onSubmit={handleAddNote}>
            <Textarea
              value={noteBody}
              onChange={(event) => setNoteBody(event.target.value)}
              placeholder="e.g. Sent follow-up email to HR"
              rows={3}
              aria-label="New timeline note"
            />
            <Button type="submit" disabled={isSavingNote || !noteBody.trim()}>
              {isSavingNote ? "Adding…" : "Add note"}
            </Button>
          </form>

          <Separator />

          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No timeline notes yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {notes.map((note) => (
                <li key={note.id} className="flex gap-3">
                  <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(note.createdAt)}
                      </p>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Delete note"
                        onClick={() => setPendingNoteDelete(note)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ApplicationFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={application}
        onSubmit={handleUpdate}
      />

      <ConfirmDeleteDialog
        open={deleteApplicationOpen}
        onOpenChange={setDeleteApplicationOpen}
        title="Delete application?"
        description={`This permanently removes ${application.jobTitle} at ${application.companyName} and its timeline notes.`}
        onConfirm={handleConfirmDeleteApplication}
      />

      <ConfirmDeleteDialog
        open={pendingNoteDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingNoteDelete(null);
          }
        }}
        title="Delete note?"
        description="This permanently removes the timeline note from this application."
        onConfirm={handleConfirmDeleteNote}
      />
    </div>
  );
};
