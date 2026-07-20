import { z } from "zod";

export const createAcceptanceSchema = z.object({
  projectId: z.string().uuid(),
  phaseId: z.string().uuid().optional(),
  type: z.enum(["phase", "final"]),
  checklist: z.string().optional(),
  notes: z.string().optional(),
});

export const updateAcceptanceResultSchema = z.object({
  result: z.enum(["passed", "rectification", "rejected"]),
  notes: z.string().optional(),
});

export type CreateAcceptanceInput = z.infer<typeof createAcceptanceSchema>;
