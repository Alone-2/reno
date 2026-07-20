import { z } from "zod";

export const createDailyLogSchema = z.object({
  phaseId: z.string().uuid().optional(),
  content: z.string().min(1),
  materials: z.string().optional(),
  workers: z.string().max(255).optional(),
  tomorrowPlan: z.string().optional(),
});

export const updateDailyLogSchema = createDailyLogSchema.partial();

export type CreateDailyLogInput = z.infer<typeof createDailyLogSchema>;
export type UpdateDailyLogInput = z.infer<typeof updateDailyLogSchema>;
