"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DownloadIcon,
  LoaderCircleIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/reui/badge";
import {
  Frame,
  FramePanel,
} from "@/components/reui/frame";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  deleteAccountRequest,
  exportAccountRequest,
} from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";

const DELETE_CONFIRMATION = "DELETE";

const getInitials = (name?: string | null, email?: string | null): string => {
  if (name?.trim()) {
    return name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return email?.slice(0, 2).toUpperCase() || "JT";
};

/**
 * Account settings — profile identity with export and delete actions.
 */
export const AccountSettings = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName = user?.name?.trim() || "Account";
  const displayEmail = user?.email ?? "Email unavailable";
  const initials = getInitials(user?.name, user?.email);
  const canDelete = deleteConfirm === DELETE_CONFIRMATION;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportAccountRequest();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `jobtracker-export-${stamp}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Your data export downloaded");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not export your data",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccountRequest();
      await logout();
      toast.success("Your account was deleted");
      router.replace("/");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not delete your account",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteOpenChange = (open: boolean) => {
    if (isDeleting) {
      return;
    }
    setDeleteOpen(open);
    if (!open) {
      setDeleteConfirm("");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your profile, data export, and account controls.
        </p>
      </div>

      <Frame stacked spacing="sm" className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200 motion-reduce:animate-none">
        <FramePanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-12 rounded-xl">
              <AvatarFallback className="rounded-xl text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold tracking-tight">
                  {displayName}
                </p>
                <Badge variant="success-light" size="sm">
                  Active
                </Badge>
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {displayEmail}
              </p>
            </div>
          </div>
        </FramePanel>

        <FramePanel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium tracking-tight">Export your data</p>
            <p className="text-sm text-muted-foreground">
              Download applications, notes, and acceptance records as JSON.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleExport()}
            disabled={isExporting}
            aria-busy={isExporting}
            className="w-full shrink-0 sm:w-auto"
          >
            {isExporting ? (
              <>
                <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
                Preparing…
              </>
            ) : (
              <>
                <DownloadIcon aria-hidden="true" />
                Download JSON
              </>
            )}
          </Button>
        </FramePanel>

        <FramePanel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium tracking-tight text-destructive-foreground dark:text-destructive">
              Delete account
            </p>
            <p className="text-sm text-muted-foreground">
              Permanently remove your login and all Job Tracker data. This
              cannot be undone.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="w-full shrink-0 sm:w-auto"
            aria-label="Delete account"
          >
            <Trash2Icon aria-hidden="true" />
            Delete
          </Button>
        </FramePanel>
      </Frame>

      <Dialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
        <DialogContent className="sm:max-w-md" showCloseButton={!isDeleting}>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Type{" "}
              <span className="font-mono font-medium text-foreground">
                {DELETE_CONFIRMATION}
              </span>{" "}
              to confirm. Applications, notes, and your login will be removed
              permanently.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="delete-confirm">Confirmation</FieldLabel>
            <Input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={(event) => setDeleteConfirm(event.target.value)}
              placeholder={DELETE_CONFIRMATION}
              autoComplete="off"
              disabled={isDeleting}
              aria-required="true"
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDeleteOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={!canDelete || isDeleting}
              aria-busy={isDeleting}
            >
              {isDeleting ? (
                <>
                  <LoaderCircleIcon
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  Deleting…
                </>
              ) : (
                "Delete forever"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
