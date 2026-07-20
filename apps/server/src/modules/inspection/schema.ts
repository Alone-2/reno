import { z } from "zod";

export const createInspectionSchema = z.object({
  projectId: z.string().uuid(),
  type: z.enum(["routine", "random"]).default("routine"),
  result: z.string().max(50).optional(),
  notes: z.string().optional(),
});

export const createViolationSchema = z.object({
  projectId: z.string().uuid(),
  inspectionId: z.string().uuid().optional(),
  type: z.string().min(1).max(50),
  description: z.string().min(1),
  fine: z.number().positive().optional(),
});

export const updateViolationStatusSchema = z.object({
  status: z.enum(["pending", "resolved", "rechecked"]),
});

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;
export type CreateViolationInput = z.infer<typeof createViolationSchema>;
