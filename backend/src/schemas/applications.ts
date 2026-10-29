import { z } from "zod";

export const applicationStatusSchema = z.enum([
  "wishlist",
  "applied",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
]);

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export const workArrangementSchema = z.enum(["onsite", "hybrid", "remote"]);

export type WorkArrangement = z.infer<typeof workArrangementSchema>;

/**
 * Create application body.
 */
export const createApplicationBodySchema = z.object({
  companyName: z.string().trim().min(1).max(255),
  jobTitle: z.string().trim().min(1).max(255),
  jobUrl: z.union([z.string().url().max(2000), z.literal("")]).optional(),
  city: z.union([z.string().trim().max(120), z.literal("")]).optional(),
  country: z.union([z.string().trim().max(120), z.literal("")]).optional(),
  workArrangement: workArrangementSchema.optional().default("onsite"),
  status: applicationStatusSchema.optional().default("wishlist"),
  appliedAt: z.string().datetime().optional().nullable(),
  notes: z.union([z.string().max(20000), z.literal("")]).optional(),
});

export type CreateApplicationBody = z.infer<typeof createApplicationBodySchema>;

/**
 * Partial update body.
 */
export const updateApplicationBodySchema = createApplicationBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type UpdateApplicationBody = z.infer<typeof updateApplicationBodySchema>;

export const applicationListSortSchema = z.enum(["createdAt", "updatedAt"]);

export type ApplicationListSort = z.infer<typeof applicationListSortSchema>;

/**
 * List query params.
 */
export const listApplicationsQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: applicationStatusSchema.optional(),
  sort: applicationListSortSchema.optional().default("createdAt"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().uuid().optional(),
});

export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
