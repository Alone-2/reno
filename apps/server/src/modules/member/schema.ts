import { z } from "zod";

export const projectMemberRoleSchema = z.enum([
  "owner",
  "contractor",
  "designer",
  "supervisor",
  "property",
  "family",
  "viewer",
]);

export const inviteProjectMemberSchema = z.object({
  username: z.string().trim().min(1).max(50),
  role: projectMemberRoleSchema.exclude(["owner"]),
});

export const updateProjectMemberSchema = z.object({
  role: projectMemberRoleSchema.exclude(["owner"]),
});

export type InviteProjectMemberInput = z.infer<typeof inviteProjectMemberSchema>;
export type UpdateProjectMemberInput = z.infer<typeof updateProjectMemberSchema>;
