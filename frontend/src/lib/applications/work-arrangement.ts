import type { WorkArrangement } from "@/lib/api/applications";
import { WORK_ARRANGEMENTS } from "@/lib/api/applications";

/**
 * Human-readable work arrangement labels.
 */
export const workArrangementLabel: Record<WorkArrangement, string> = {
  onsite: "Onsite",
  hybrid: "Hybrid",
  remote: "Remote",
};

/**
 * Short helper copy for the application form.
 */
export const workArrangementDescription: Record<WorkArrangement, string> = {
  onsite: "Office-based role. Add city and country when known.",
  hybrid: "Mix of office and remote. Add the office location when known.",
  remote: "Fully remote. City and country are optional (for example timezone).",
};

/**
 * Formats arrangement + place for lists and detail meta.
 */
export const formatWorkLocation = (input: {
  readonly workArrangement: WorkArrangement;
  readonly city: string | null;
  readonly country: string | null;
}): string => {
  const place = [input.city, input.country].filter(Boolean).join(", ");
  const arrangement = workArrangementLabel[input.workArrangement];

  if (place) {
    return `${arrangement} · ${place}`;
  }

  return arrangement;
};

/**
 * Options for radio / select UIs.
 */
export const workArrangementOptions = WORK_ARRANGEMENTS.map((value) => ({
  value,
  label: workArrangementLabel[value],
}));
