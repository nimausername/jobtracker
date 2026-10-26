"use client";

import { PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  APPLICATION_STATUSES,
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
  type Application,
  type ApplicationInput,
  type ApplicationStatus,
} from "@/lib/api/applications";
import { statusBadgeVariant, statusLabel } from "@/lib/applications/status";

/**
 * Applications list with filters and create/edit dialog.
 */
export const ApplicationsWorkspace = () => {
  const [items, setItems] = useState<Application[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listApplications({
        q: q.trim() || undefined,
        status: status === "all" ? undefined : status,
        limit: 50,
      });
      setItems(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(handle);
  }, [load]);

  const handleCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (application: Application) => {
    setEditing(application);
    setDialogOpen(true);
  };

  const handleSubmit = async (input: ApplicationInput) => {
    if (editing) {
      await updateApplication(editing.id, input);
      toast.success("Application updated");
    } else {
      await createApplication(input);
      toast.success("Application added");
    }
    await load();
  };

  const handleDelete = async (application: Application) => {
    const confirmed = window.confirm(
      `Delete ${application.jobTitle} at ${application.companyName}?`,
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteApplication(application.id);
      toast.success("Application deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, filter, and update your pipeline.
          </p>
        </div>
        <Button onClick={handleCreate} aria-label="Add application">
          <PlusIcon />
          Add application
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search company or title"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            aria-label="Search applications"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) =>
            setStatus((value as ApplicationStatus | "all") ?? "all")
          }
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {APPLICATION_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {statusLabel[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <p className="text-sm text-muted-foreground">
                    No applications yet.
                  </p>
                  <Button className="mt-3" size="sm" onClick={handleCreate}>
                    Add your first
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.companyName}</TableCell>
                  <TableCell>{item.jobTitle}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.isRemote
                      ? "Remote"
                      : [item.city, item.country].filter(Boolean).join(", ") ||
                        "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(item.status)}>
                      {statusLabel[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Link
                      href={`/dashboard/applications/${item.id}`}
                      className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
                    >
                      Open
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void handleDelete(item)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ApplicationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
