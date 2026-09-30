import { Hono } from "hono";
import { ErrorCode } from "../../common/error-codes";
import { error, success } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { requireProjectPermission } from "../../middleware/project-permission";
import { inviteProjectMemberSchema, updateProjectMemberSchema } from "./schema";
import {
  inviteProjectMember,
  listProjectMembers,
  removeProjectMember,
  updateProjectMemberRole,
} from "./service";

export const memberRoutes = new Hono();

memberRoutes.get(
  "/api/projects/:id/members",
  requireAuth,
  requireProjectPermission("view"),
  async (c) => success(c, await listProjectMembers(c.req.param("id"))),
);

memberRoutes.post(
  "/api/projects/:id/members",
  requireAuth,
  requireProjectPermission("member.manage"),
  async (c) => {
    const parsed = inviteProjectMemberSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const result = await inviteProjectMember(
      c.req.param("id"),
      parsed.data.username,
      parsed.data.role,
      c.get("user")!.userId,
    );
    if ("error" in result) return error(c, result.error);
    return success(c, result.member);
  },
);

memberRoutes.put(
  "/api/projects/:id/members/:memberId",
  requireAuth,
  requireProjectPermission("member.manage"),
  async (c) => {
    const parsed = updateProjectMemberSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const result = await updateProjectMemberRole(
      c.req.param("id"),
      c.req.param("memberId"),
      parsed.data.role,
    );
    if ("error" in result) return error(c, result.error);
    return success(c, result.member);
  },
);

memberRoutes.delete(
  "/api/projects/:id/members/:memberId",
  requireAuth,
  requireProjectPermission("member.manage"),
  async (c) => {
    const result = await removeProjectMember(c.req.param("id"), c.req.param("memberId"));
    if ("error" in result) return error(c, result.error);
    return success(c, null, "成员已移除");
  },
);
