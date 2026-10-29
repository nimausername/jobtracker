import { apiRequest } from "./client";
import type { ApplicationStatus } from "./applications";

export const APPLICATION_ACTIVITY_KINDS = [
  "created",
  "status_change",
  "note",
] as const;

export type ApplicationActivityKind =
  (typeof APPLICATION_ACTIVITY_KINDS)[number];

export type ApplicationNote = {
  readonly id: string;
  readonly applicationId: string;
  readonly kind: ApplicationActivityKind;
  readonly body: string;
  readonly fromStatus: ApplicationStatus | null;
  readonly toStatus: ApplicationStatus | null;
  readonly createdAt: string;
  readonly deletable: boolean;
};

/**
 * Lists timeline activities for an application.
 */
export const listNotes = (applicationId: string): Promise<ApplicationNote[]> =>
  apiRequest<ApplicationNote[]>(`/v1/applications/${applicationId}/notes`);

/**
 * Adds a timeline note.
 */
export const createNote = (
  applicationId: string,
  body: string,
): Promise<ApplicationNote> =>
  apiRequest<ApplicationNote>(`/v1/applications/${applicationId}/notes`, {
    method: "POST",
    body: { body },
  });

/**
 * Updates a timeline note body.
 */
export const updateNote = (
  applicationId: string,
  noteId: string,
  body: string,
): Promise<ApplicationNote> =>
  apiRequest<ApplicationNote>(
    `/v1/applications/${applicationId}/notes/${noteId}`,
    {
      method: "PATCH",
      body: { body },
    },
  );

/**
 * Deletes a timeline note.
 */
export const deleteNote = async (
  applicationId: string,
  noteId: string,
): Promise<void> => {
  await apiRequest<null>(
    `/v1/applications/${applicationId}/notes/${noteId}`,
    {
      method: "DELETE",
    },
  );
};
