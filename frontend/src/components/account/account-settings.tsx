"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DownloadIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/auth-provider";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/reui/alert";
import { Badge } from "@/components/reui/badge";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame";
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
import { Separator } from "@/components/ui/separator";
import {
  deleteAccountRequest,
  exportAccountRequest,
} from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";

const DELETE_CONFIRMATION = "DELETE";

/**
 * Account settings: profile summary, data export, and account deletion.
 */
export const AccountSettings = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName = user?.name?.trim() || "Not set";
  const displayEmail = user?.email ?? "Not available";
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, download your data, or permanently delete your
          account.
        </p>
      </div>

      <Frame>
        <FrameHeader>
          <FrameTitle>Profile</FrameTitle>
          <FrameDescription>
            Details from your Job Tracker sign-in.
          </FrameDescription>
        </FrameHeader>
        <FramePanel className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Name
              </dt>
              <dd className="text-sm font-medium">{displayName}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Email
              </dt>
              <dd className="text-sm font-medium break-all">{displayEmail}</dd>
            </div>
          </dl>
          <Separator />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success-light" size="sm">
              Signed in
            </Badge>
            <span className="text-xs text-muted-foreground">
              Session cookies are httpOnly and not readable by page scripts.
            </span>
          </div>
        </FramePanel>
      </Frame>

      <Frame>
        <FrameHeader>
          <FrameTitle>Your data</FrameTitle>
          <FrameDescription>
            Export a JSON copy of your applications, notes, and acceptance
            records.
          </FrameDescription>
        </FrameHeader>
        <FramePanel className="space-y-4">
          <Alert variant="info">
            <ShieldCheckIcon aria-hidden="true" />
            <AlertTitle>Portable export</AlertTitle>
            <AlertDescription>
              The file includes your profile, job applications, timeline notes,
              and legal acceptance history for this account.
            </AlertDescription>
          </Alert>
          <Button
            type="button"
            onClick={() => void handleExport()}
            disabled={isExporting}
            aria-busy={isExporting}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <>
                <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
                Preparing export…
              </>
            ) : (
              <>
                <DownloadIcon aria-hidden="true" />
                Download my data
              </>
            )}
          </Button>
        </FramePanel>
      </Frame>

      <Frame>
        <FrameHeader>
          <FrameTitle>Danger zone</FrameTitle>
          <FrameDescription>
            Permanently delete your account and all related Job Tracker data.
          </FrameDescription>
        </FrameHeader>
        <FramePanel className="space-y-4">
          <Alert variant="destructive">
            <TriangleAlertIcon aria-hidden="true" />
            <AlertTitle>This cannot be undone</AlertTitle>
            <AlertDescription>
              Deleting removes your applications, notes, acceptance records, and
              Keycloak login for this service. There are currently no backups to
              restore from.
            </AlertDescription>
          </Alert>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="w-full sm:w-auto"
            aria-label="Delete account"
          >
            <Trash2Icon aria-hidden="true" />
            Delete account
          </Button>
        </FramePanel>
      </Frame>

      <Dialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
        <DialogContent className="sm:max-w-md" showCloseButton={!isDeleting}>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Type <span className="font-mono font-medium text-foreground">{DELETE_CONFIRMATION}</span>{" "}
              to confirm. Your account and data will be removed permanently.
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
