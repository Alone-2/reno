import { z } from "zod";

// ── 创建空间 ──
export const createSpaceSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(50),
  area: z.coerce.number().positive().optional(),
  notes: z.string().max(2000).optional(),
});

// ── 更新空间（partial） ──
export const updateSpaceSchema = createSpaceSchema.partial();

// ── 创建注意事项 ──
export const createChecklistItemSchema = z.object({
  spaceId: z.string().uuid(),
  category: z.string().min(1).max(50),
  content: z.string().min(1).max(2000),
  linkedPhaseId: z.string().uuid().optional(),
});

// ── 更新注意事项状态 ──
export const updateChecklistStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "rectification"]),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;
export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;
export type UpdateChecklistStatusInput = z.infer<typeof updateChecklistStatusSchema>;
