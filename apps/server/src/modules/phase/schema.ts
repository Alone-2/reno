import { STAGE_STATUS } from "@reno/shared";
import { z } from "zod";

// ── 创建施工阶段 ──
export const createPhaseSchema = z.object({
  projectId: z.string().uuid(),
  phaseName: z.string().min(1).max(50),
  sortOrder: z.number().int().min(0),
  plannedStart: z.string().date().optional(),
  plannedEnd: z.string().date().optional(),
  standardPhaseKey: z.string().max(50).optional(),
  isPrimaryCurrent: z.boolean().optional(),
  isAcceptanceRequired: z.boolean().optional(),
});

// ── 更新施工阶段（partial） ──
export const updatePhaseSchema = createPhaseSchema.partial();

// ── 更新阶段状态 ──
export const updatePhaseStatusSchema = z.object({
  status: z.enum(STAGE_STATUS),
  progressPercent: z.number().int().min(0).max(100).optional(),
});

export type CreatePhaseInput = z.infer<typeof createPhaseSchema>;
export type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>;
export type UpdatePhaseStatusInput = z.infer<typeof updatePhaseStatusSchema>;
