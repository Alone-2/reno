import { Hono } from "hono";
import { ErrorCode } from "../../common/error-codes";
import { success, error } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { rbac } from "../../middleware/rbac";
import { createAcceptanceSchema, updateAcceptanceResultSchema } from "./schema";
import {
  listAcceptances,
  getAcceptance,
  createAcceptance,
  updateAcceptanceResult,
} from "./service";

export const acceptanceRoutes = new Hono();

// 获取验收列表
acceptanceRoutes.get("/api/projects/:id/acceptances", requireAuth, async (c) => {
  const projectId = c.req.param("id");
  const items = await listAcceptances(projectId);
  return success(c, items);
});

// 获取验收详情
acceptanceRoutes.get("/api/acceptances/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const result = await getAcceptance(id);
  if ("error" in result) return error(c, result.error);
  return success(c, result.acceptance);
});

// 发起验收（物业/装修公司/管理员）
acceptanceRoutes.post(
  "/api/acceptances",
  requireAuth,
  rbac("property", "contractor", "admin"),
  async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = createAcceptanceSchema.safeParse(body);
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const item = await createAcceptance(parsed.data);
    return success(c, item);
  },
);

// 验收通过/驳回
acceptanceRoutes.post("/api/acceptances/:id/approve", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = updateAcceptanceResultSchema.safeParse(body);
  if (!parsed.success) return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  const result = await updateAcceptanceResult(id, parsed.data.result, parsed.data.notes);
  if ("error" in result) return error(c, result.error);
  return success(c, result.acceptance);
});
