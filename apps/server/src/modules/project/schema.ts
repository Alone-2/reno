import { z } from "zod";
import { PROJECT_TYPES, PROJECT_STATUS } from "@reno/shared";

export const createProjectSchema = z.object({
  propertyId: z.string().uuid(),
  ownerId: z.string().uuid().optional(),
  contractorId: z.string().uuid().optional(),
  designerId: z.string().uuid().optional(),
  type: z.enum(PROJECT_TYPES),
  scope: z.string().max(500).optional(),
  plannedStart: z.string().date().optional(),
  plannedEnd: z.string().date().optional(),
  depositAmount: z.number().positive().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const approveProjectSchema = z.object({
  approved: z.boolean(),
  rejectReason: z.string().max(500).optional(),
  permitNo: z.string().max(50).optional(),
});

export const queryProjectsSchema = z.object({
  status: z.enum(PROJECT_STATUS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ApproveProjectInput = z.infer<typeof approveProjectSchema>;
