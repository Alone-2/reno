import { ACTION_ITEM_PRIORITY, ACTION_ITEM_STATUS, ACTION_ITEM_TYPES } from "@reno/shared";
import { z } from "zod";

export const actionItemInputSchema = z.object({
  type: z.enum(ACTION_ITEM_TYPES).default("task"),
  priority: z.enum(ACTION_ITEM_PRIORITY).default("normal"),
  status: z.enum(ACTION_ITEM_STATUS).default("todo"),
  title: z.string().trim().min(1).max(200),
  notes: z.string().nullable().optional(),
  decisionResult: z.string().nullable().optional(),
  dueDate: z.string().date().nullable().optional(),
  spaceId: z.string().uuid().nullable().optional(),
  stageId: z.string().uuid().nullable().optional(),
  relatedEntityType: z.string().max(80).nullable().optional(),
  relatedEntityId: z.string().uuid().nullable().optional(),
  responsiblePartyId: z.string().uuid().nullable().optional(),
});

export const updateActionItemSchema = actionItemInputSchema.partial();
export const actionItemStatusSchema = z.object({
  status: z.enum(ACTION_ITEM_STATUS),
  reason: z.string().max(500).optional(),
});
export type ActionItemInput = z.infer<typeof actionItemInputSchema>;
export type UpdateActionItemInput = z.infer<typeof updateActionItemSchema>;
