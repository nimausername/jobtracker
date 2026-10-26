import { apiRequest } from "./client";

export type ApplicationNote = {
  readonly id: string;
  readonly applicationId: string;
  readonly body: string;
  readonly createdAt: string;
};

/**
 * Lists timeline notes for an application.
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
