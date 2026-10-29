"use client";

import {
  BriefcaseBusinessIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ApplicationFormSheet } from "@/components/applications/application-form-sheet";
import { ApplicationStatusSelect } from "@/components/applications/application-status-select";
import { ConfirmDeleteDialog } from "@/components/applications/confirm-delete-dialog";
import { Frame, FramePanel } from "@/components/reui/frame";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
  updateApplicationStatus,
  type Application,
  type ApplicationInput,
  type ApplicationStatus,
} from "@/lib/api/applications";
import { statusLabel } from "@/lib/applications/status";
import { formatWorkLocation } from "@/lib/applications/work-arrangement";

const parseStatusParam = (
  value: string | null,
): ApplicationStatus | "all" => {
  if (
    value &&
    (APPLICATION_STATUSES as readonly string[]).includes(value)
  ) {
    return value as ApplicationStatus;
  }

  return "all";
};

const formatLocation = (item: Application): string =>
  formatWorkLocation({
    workArrangement: item.workArrangement,
    city: item.city,
    country: item.country,
  });

/**
 * Applications list — Frame-led table workspace matching Overview language.
 */
export const ApplicationsWorkspace = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Application[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "all">(() =>
    parseStatusParam(searchParams.get("status")),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Application | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setStatus(parseStatusParam(searchParams.get("status")));
  }, [searchParams]);

  const syncStatusToUrl = (next: ApplicationStatus | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("status");
    } else {
      params.set("status", next);
    }
    const query = params.toString();
    router.replace(
      query
        ? `/dashboard/applications?${query}`
        : "/dashboard/applications",
    );
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listApplications({
        q: q.trim() || undefined,
        status: status === "all" ? undefined : status,
        limit: 50,
      });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
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

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      await deleteApplication(pendingDelete.id);
      toast.success("Application deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      throw err instanceof Error ? err : new Error("Delete failed");
    }
  };

  const handleStatusChange = (value: string | null) => {
    const next = (value as ApplicationStatus | "all") ?? "all";
    setStatus(next);
    syncStatusToUrl(next);
  };

  const handleApplicationStatusChange = async (
    application: Application,
    nextStatus: ApplicationStatus,
  ) => {
    if (nextStatus === application.status) {
      return;
    }

    const previousItems = items;
    setStatusUpdatingId(application.id);
    setItems((prev) => {
      if (status !== "all" && nextStatus !== status) {
        return prev.filter((item) => item.id !== application.id);
      }

      return prev.map((item) =>
        item.id === application.id
          ? { ...item, status: nextStatus }
          : item,
      );
    });

    try {
      const updated = await updateApplicationStatus(
        application.id,
        nextStatus,
      );
      setItems((prev) => {
        if (status !== "all" && updated.status !== status) {
          return prev.filter((item) => item.id !== updated.id);
        }

        const exists = prev.some((item) => item.id === updated.id);
        if (!exists) {
          return prev;
        }

        return prev.map((item) =>
          item.id === updated.id ? updated : item,
        );
      });
      toast.success(`Moved to ${statusLabel[updated.status]}`);
    } catch (err) {
      setItems(previousItems);
      toast.error(
        err instanceof Error ? err.message : "Could not update status",
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const isEmpty = !isLoading && items.length === 0;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, filter, and update your pipeline.
          </p>
        </div>
        <Button
          size="sm"
          type="button"
          onClick={handleCreate}
          aria-label="Add application"
        >
          <PlusIcon />
          Add application
        </Button>
      </div>

      {error ? (
        <div
          className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p className="text-sm text-destructive">{error}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              void load();
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}

      <Frame className="min-w-0" spacing="sm">
        <FramePanel fit className="py-2.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8"
                placeholder={
                  status === "all"
                    ? "Search all tracked roles"
                    : `Search ${statusLabel[status].toLowerCase()} roles`
                }
                value={q}
                onChange={(event) => setQ(event.target.value)}
                aria-label="Search applications"
              />
            </div>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger
                className="w-full sm:w-40"
                size="sm"
                aria-label="Filter by status"
              >
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
        </FramePanel>

        <FramePanel className="p-0">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : isEmpty ? (
            <Empty className="border-0 py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BriefcaseBusinessIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>
                  {q || status !== "all"
                    ? "No matching applications"
                    : "No applications yet"}
                </EmptyTitle>
                <EmptyDescription>
                  {q || status !== "all"
                    ? "Try a different search or clear the status filter."
                    : "Add your first role to start tracking the pipeline."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                {q || status !== "all" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setQ("");
                      handleStatusChange("all");
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button type="button" size="sm" onClick={handleCreate}>
                    Add application
                  </Button>
                )}
              </EmptyContent>
            </Empty>
          ) : (
            <div className="min-w-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
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
                      <TableCell className="text-muted-foreground">
                        {formatLocation(item)}
                      </TableCell>
                      <TableCell>
                        <ApplicationStatusSelect
                          value={item.status}
                          disabled={statusUpdatingId === item.id}
                          aria-label={`Status for ${item.jobTitle} at ${item.companyName}`}
                          onValueChange={(nextStatus) => {
                            void handleApplicationStatusChange(
                              item,
                              nextStatus,
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="-me-1.5"
                                aria-label={`Actions for ${item.jobTitle} at ${item.companyName}`}
                              />
                            }
                          >
                            <MoreHorizontalIcon aria-hidden="true" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/applications/${item.id}`,
                                  )
                                }
                              >
                                <EyeIcon aria-hidden="true" />
                                Open
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(item)}
                              >
                                <PencilIcon aria-hidden="true" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setPendingDelete(item)}
                              >
                                <Trash2Icon aria-hidden="true" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </FramePanel>
      </Frame>

      <ApplicationFormSheet
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
        title="Delete application?"
        description={
          pendingDelete
            ? `This permanently removes ${pendingDelete.jobTitle} at ${pendingDelete.companyName} and its timeline notes.`
            : "This permanently removes the application and its timeline notes."
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
