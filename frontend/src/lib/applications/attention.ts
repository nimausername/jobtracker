import type { Application, ApplicationStatus } from "@/lib/api/applications";

const ACTIVE_STATUSES = new Set<ApplicationStatus>([
  "wishlist",
  "applied",
  "interview",
  "offer",
]);

export type AttentionReason =
  | "stale_applied"
  | "stale_interview"
  | "missing_applied_at"
  | "missing_role_notes";

export type AttentionItem = {
  readonly application: Application;
  readonly reason: AttentionReason;
  readonly label: string;
  readonly priority: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const isOlderThan = (iso: string, days: number, now: number): boolean =>
  now - new Date(iso).getTime() > days * DAY_MS;

const hasRoleNotes = (notes: string | null): boolean =>
  Boolean(notes?.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim());

/**
 * Builds prioritized “needs attention” items from applications.
 */
export const getAttentionItems = (
  applications: readonly Application[],
  now = Date.now(),
): AttentionItem[] => {
  const items: AttentionItem[] = [];

  for (const application of applications) {
    if (!ACTIVE_STATUSES.has(application.status)) {
      continue;
    }

    if (
      application.status === "applied" &&
      isOlderThan(application.updatedAt, 14, now)
    ) {
      items.push({
        application,
        reason: "stale_applied",
        label: "No update in 14+ days",
        priority: 1,
      });
    }

    if (
      application.status === "interview" &&
      isOlderThan(application.updatedAt, 7, now)
    ) {
      items.push({
        application,
        reason: "stale_interview",
        label: "Interview stage quiet for 7+ days",
        priority: 0,
      });
    }

    if (application.status === "applied" && !application.appliedAt) {
      items.push({
        application,
        reason: "missing_applied_at",
        label: "Applied date not set",
        priority: 2,
      });
    }

    if (!hasRoleNotes(application.notes)) {
      items.push({
        application,
        reason: "missing_role_notes",
        label: "Missing role notes",
        priority: 3,
      });
    }
  }

  const seen = new Set<string>();

  return items
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      return (
        new Date(a.application.updatedAt).getTime() -
        new Date(b.application.updatedAt).getTime()
      );
    })
    .filter((item) => {
      if (seen.has(item.application.id)) {
        return false;
      }

      seen.add(item.application.id);
      return true;
    });
};
