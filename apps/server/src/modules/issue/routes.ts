import { Hono } from "hono";
import { ErrorCode } from "../../common/error-codes";
import { error, success } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { requireProjectPermission } from "../../middleware/project-permission";
import { issueInputSchema, issueStatusSchema, updateIssueSchema } from "./schema";
import { changeIssueStatus, createIssue, listIssues, updateIssue } from "./service";

export const issueRoutes = new Hono();

issueRoutes.get(
  "/api/projects/:id/issues",
  requireAuth,
  requireProjectPermission("view"),
  async (c) =>
    success(c, await listIssues(c.req.param("id"), c.req.query("includeVerified") === "true")),
);

issueRoutes.post(
  "/api/projects/:id/issues",
  requireAuth,
  requireProjectPermission("progress.write"),
  async (c) => {
    const parsed = issueInputSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const result = await createIssue(c.req.param("id"), parsed.data, c.get("user")?.userId);
    return success(c, result.issue);
  },
);

issueRoutes.put(
  "/api/projects/:id/issues/:issueId",
  requireAuth,
  requireProjectPermission("progress.write"),
  async (c) => {
    const parsed = updateIssueSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const result = await updateIssue(
      c.req.param("id"),
      c.req.param("issueId"),
      parsed.data,
      c.get("user")?.userId,
    );
    if ("error" in result) return error(c, result.error);
    return success(c, result.issue);
  },
);

issueRoutes.put(
  "/api/projects/:id/issues/:issueId/status",
  requireAuth,
  requireProjectPermission("progress.write"),
  async (c) => {
    const parsed = issueStatusSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const result = await changeIssueStatus(
      c.req.param("id"),
      c.req.param("issueId"),
      parsed.data.status,
      parsed.data.resolutionNotes,
      parsed.data.reason,
      c.get("user")?.userId,
    );
    if ("error" in result) return error(c, result.error);
    return success(c, result.issue);
  },
);
