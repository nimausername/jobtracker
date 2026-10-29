import { apiRequest } from "./client";

export const APPLICATION_STATUSES = [
  "wishlist",
  "applied",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const WORK_ARRANGEMENTS = ["onsite", "hybrid", "remote"] as const;

export type WorkArrangement = (typeof WORK_ARRANGEMENTS)[number];

export type Application = {
  readonly id: string;
  readonly companyName: string;
  readonly jobTitle: string;
  readonly jobUrl: string | null;
  readonly city: string | null;
  readonly country: string | null;
  readonly workArrangement: WorkArrangement;
  readonly status: ApplicationStatus;
  readonly appliedAt: string | null;
  readonly notes: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ApplicationSummary = {
  readonly total: number;
  readonly byStatus: Record<ApplicationStatus, number>;
};

export type ApplicationInput = {
  readonly companyName: string;
  readonly jobTitle: string;
  readonly jobUrl?: string;
  readonly city?: string;
  readonly country?: string;
  readonly workArrangement?: WorkArrangement;
  readonly status?: ApplicationStatus;
  readonly appliedAt?: string | null;
  readonly notes?: string;
};

export type ApplicationListSort = "createdAt" | "updatedAt";

export type ListApplicationsParams = {
  readonly q?: string;
  readonly status?: ApplicationStatus;
  readonly sort?: ApplicationListSort;
  readonly limit?: number;
  readonly cursor?: string;
};

/**
 * Fetches dashboard status summary.
 */
export const getApplicationsSummary = (): Promise<ApplicationSummary> =>
  apiRequest<ApplicationSummary>("/v1/applications/summary");

/**
 * Lists applications with optional filters.
 */
export const listApplications = async (
  params: ListApplicationsParams = {},
): Promise<Application[]> => {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.sort) search.set("sort", params.sort);
  if (params.limit) search.set("limit", String(params.limit));
  if (params.cursor) search.set("cursor", params.cursor);
  const query = search.toString();
  return apiRequest<Application[]>(
    `/v1/applications${query ? `?${query}` : ""}`,
  );
};

/**
 * Fetches a single application.
 */
export const getApplication = (id: string): Promise<Application> =>
  apiRequest<Application>(`/v1/applications/${id}`);

/**
 * Creates an application.
 */
export const createApplication = (
  input: ApplicationInput,
): Promise<Application> =>
  apiRequest<Application>("/v1/applications", {
    method: "POST",
    body: input,
  });

/**
 * Updates an application.
 */
export const updateApplication = (
  id: string,
  input: Partial<ApplicationInput>,
): Promise<Application> =>
  apiRequest<Application>(`/v1/applications/${id}`, {
    method: "PATCH",
    body: input,
  });

/**
 * Updates only the application pipeline status.
 */
export const updateApplicationStatus = (
  id: string,
  status: ApplicationStatus,
): Promise<Application> => updateApplication(id, { status });

/**
 * Deletes an application.
 */
export const deleteApplication = async (id: string): Promise<void> => {
  await apiRequest<null>(`/v1/applications/${id}`, {
    method: "DELETE",
  });
};
