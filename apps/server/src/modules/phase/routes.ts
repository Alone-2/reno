import { Hono } from "hono";
import { ErrorCode } from "../../common/error-codes";
import { success, error } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { rbac } from "../../middleware/rbac";
import { createPhaseSchema, updatePhaseStatusSchema } from "./schema";
import { listPhases, createPhase, updatePhaseStatus, deletePhase } from "./service";

export const phaseRoutes = new Hono();

// ── 获取项目的阶段列表 ──
phaseRoutes.get("/api/projects/:id/phases", requireAuth, async (c) => {
  const projectId = c.req.param("id");
  const result = await listPhases(projectId);
  return success(c, result.list);
});

// ── 创建施工阶段（装修公司 / 管理员 / 物业） ──
phaseRoutes.post(
  "/api/projects/:id/phases",
  requireAuth,
  rbac("contractor", "admin", "property"),
  async (c) => {
    const projectId = c.req.param("id");
    const body = await c.req.json().catch(() => null);
    const parsed = createPhaseSchema.safeParse({ ...body, projectId });
    if (!parsed.success) {
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    }
    const result = await createPhase(parsed.data);
    return success(c, result.phase);
  },
);

// ── 更新阶段状态（装修公司 / 管理员 / 物业） ──
phaseRoutes.put(
  "/api/phases/:id/status",
  requireAuth,
  rbac("contractor", "admin", "property"),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => null);
    const parsed = updatePhaseStatusSchema.safeParse(body);
    if (!parsed.success) {
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    }
    const { status, progressPercent } = parsed.data;
    const result = await updatePhaseStatus(id, status, progressPercent);
    if ("error" in result) return error(c, result.error);
    return success(c, result.phase);
  },
);

// ── 删除阶段 ──
phaseRoutes.delete("/api/phases/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const result = await deletePhase(id);
  if ("error" in result) return error(c, result.error);
  return success(c, null, "阶段已删除");
});
