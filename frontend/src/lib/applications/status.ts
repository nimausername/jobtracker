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
 * Badge variant for a pipeline status.
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
