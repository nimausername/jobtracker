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
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  deleteAccountRequest,
  exportAccountRequest,
} from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";

const DELETE_CONFIRMATION = "DELETE";

/**
 * Data section — export and account deletion in one stacked Frame.
 */
export const AccountDataSection = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
    <>
      <Frame spacing="default" stacked className="min-w-0">
        <FrameHeader>
          <FrameTitle>Data</FrameTitle>
          <FrameDescription>
            Export a copy or permanently delete your account.
          </FrameDescription>
        </FrameHeader>

        <FramePanel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium tracking-tight">Export as JSON</p>
            <p className="text-sm text-muted-foreground">
              Applications, notes, and legal acceptances.
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
                Download
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
              Removes your login and all Job Tracker data.
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

      <AlertDialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Type{" "}
              <span className="font-mono font-medium text-foreground">
                {DELETE_CONFIRMATION}
              </span>{" "}
              to confirm. Applications, notes, and your login will be removed
              permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
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
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!canDelete || isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
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
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
