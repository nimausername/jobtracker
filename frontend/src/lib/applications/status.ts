import type { BadgeProps } from "@/components/reui/badge";
import type { ApplicationStatus } from "@/lib/api/applications";

/**
 * Human-readable status labels.
 */
export const statusLabel: Record<ApplicationStatus, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

/**
 * shadcn Badge variant for a pipeline status (legacy UI badge).
 */
export const statusBadgeVariant = (
  status: ApplicationStatus,
): "outline" | "secondary" | "default" | "destructive" => {
  switch (status) {
    case "offer":
      return "default";
    case "interview":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
};

/**
 * ReUI Badge light variant for pipeline status chips.
 */
export const pipelineBadgeVariant = (
  status: ApplicationStatus,
): NonNullable<BadgeProps["variant"]> => {
  switch (status) {
    case "wishlist":
      return "secondary";
    case "applied":
      return "info-light";
    case "interview":
      return "warning-light";
    case "offer":
      return "success-light";
    case "rejected":
      return "destructive-light";
    case "withdrawn":
      return "outline";
    default:
      return "outline";
  }
};
