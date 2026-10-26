"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationInput,
  type ApplicationStatus,
} from "@/lib/api/applications";
import { statusLabel } from "@/lib/applications/status";

type ApplicationFormDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly initial?: Application | null;
  readonly onSubmit: (input: ApplicationInput) => Promise<void>;
};

type FormState = {
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  city: string;
  country: string;
  isRemote: boolean;
  status: ApplicationStatus;
  notes: string;
};

const emptyForm = (): FormState => ({
  companyName: "",
  jobTitle: "",
  jobUrl: "",
  city: "",
  country: "",
  isRemote: false,
  status: "wishlist",
  notes: "",
});

/**
 * Create/edit dialog for a job application.
 */
export const ApplicationFormDialog = ({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: ApplicationFormDialogProps) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initial) {
      setForm({
        companyName: initial.companyName,
        jobTitle: initial.jobTitle,
        jobUrl: initial.jobUrl ?? "",
        city: initial.city ?? "",
        country: initial.country ?? "",
        isRemote: initial.isRemote,
        status: initial.status,
        notes: initial.notes ?? "",
      });
    } else {
      setForm(emptyForm());
    }
    setError(null);
  }, [open, initial]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        companyName: form.companyName.trim(),
        jobTitle: form.jobTitle.trim(),
        jobUrl: form.jobUrl.trim() || undefined,
        city: form.city.trim() || undefined,
        country: form.country.trim() || undefined,
        isRemote: form.isRemote,
        status: form.status,
        notes: form.notes.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit application" : "Add application"}
          </DialogTitle>
          <DialogDescription>
            Track company, role, location, and pipeline status.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company</Label>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  companyName: event.target.value,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job title</Label>
            <Input
              id="jobTitle"
              value={form.jobTitle}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, jobTitle: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobUrl">Job URL</Label>
            <Input
              id="jobUrl"
              type="url"
              placeholder="https://"
              value={form.jobUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, jobUrl: event.target.value }))
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, city: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, country: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  status: value as ApplicationStatus,
                }))
              }
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabel[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isRemote}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  isRemote: event.target.checked,
                }))
              }
            />
            Remote role
          </label>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              rows={3}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
