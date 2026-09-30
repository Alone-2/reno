import { ISSUE_SEVERITY, ISSUE_SOURCE_TYPES, ISSUE_STATUS } from "@reno/shared";
import { z } from "zod";

export const issueInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1),
  severity: z.enum(ISSUE_SEVERITY).default("medium"),
  sourceType: z.enum(ISSUE_SOURCE_TYPES).default("manual"),
  sourceEntityId: z.string().uuid().nullable().optional(),
  spaceId: z.string().uuid().nullable().optional(),
  stageId: z.string().uuid().nullable().optional(),
  responsiblePartyId: z.string().uuid().nullable().optional(),
  dueDate: z.string().date().nullable().optional(),
});
export const updateIssueSchema = issueInputSchema
  .partial()
  .extend({ resolutionNotes: z.string().nullable().optional() });
export const issueStatusSchema = z.object({
  status: z.enum(ISSUE_STATUS),
  resolutionNotes: z.string().nullable().optional(),
  reason: z.string().max(500).optional(),
});
export type IssueInput = z.infer<typeof issueInputSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
