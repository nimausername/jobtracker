"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/lib/api/applications";
import {
  statusIndicatorClass,
  statusLabel,
} from "@/lib/applications/status";
import { cn } from "@/lib/utils";

type ApplicationStatusSelectProps = {
  readonly value: ApplicationStatus;
  readonly onValueChange: (status: ApplicationStatus) => void;
  readonly disabled?: boolean;
  readonly size?: "sm" | "default";
  /** Ghost for table/detail; field for bordered form controls. */
  readonly variant?: "ghost" | "field";
  readonly className?: string;
  readonly id?: string;
  readonly "aria-label"?: string;
};

type StatusOptionProps = {
  readonly status: ApplicationStatus;
};

/**
 * Linear-style status row: colored dot + plain label.
 */
const StatusOption = ({ status }: StatusOptionProps) => {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          statusIndicatorClass[status],
        )}
      />
      <span className="text-sm text-foreground">{statusLabel[status]}</span>
    </span>
  );
};

/**
 * Compact status picker for inline updates in the table and detail views.
 */
export const ApplicationStatusSelect = ({
  value,
  onValueChange,
  disabled = false,
  size = "sm",
  variant = "ghost",
  className,
  id,
  "aria-label": ariaLabel = "Application status",
}: ApplicationStatusSelectProps) => {
  const handleValueChange = (next: string | null) => {
    if (!next || next === value) {
      return;
    }

    if (!(APPLICATION_STATUSES as readonly string[]).includes(next)) {
      return;
    }

    onValueChange(next as ApplicationStatus);
  };

  return (
    <Select
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        size={size}
        className={cn(
          variant === "ghost" && [
            "min-w-[7.75rem] border-transparent bg-transparent shadow-none",
            "hover:bg-muted/60 dark:hover:bg-muted/40",
            "focus-visible:border-ring data-[popup-open]:bg-muted/60",
            "dark:bg-transparent dark:hover:bg-muted/40",
          ],
          variant === "field" && "w-full min-w-0",
          className,
        )}
        aria-label={ariaLabel}
      >
        <SelectValue>
          <StatusOption status={value} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {APPLICATION_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            <StatusOption status={status} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
