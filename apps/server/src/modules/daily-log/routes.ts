import { Hono } from "hono";
import { ErrorCode } from "../../common/error-codes";
import { success, error } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { rbac } from "../../middleware/rbac";
import { createDailyLogSchema, updateDailyLogSchema } from "./schema";
import { listDailyLogs, createDailyLog, updateDailyLog, deleteDailyLog } from "./service";

export const dailyLogRoutes = new Hono();

// 获取施工日志列表
dailyLogRoutes.get("/api/projects/:id/logs", requireAuth, async (c) => {
  const projectId = c.req.param("id");
  const logs = await listDailyLogs(projectId);
  return success(c, logs);
});

// 提交施工日志（装修公司/管理员）
dailyLogRoutes.post(
  "/api/projects/:id/logs",
  requireAuth,
  rbac("contractor", "admin"),
  async (c) => {
    const projectId = c.req.param("id");
    const body = await c.req.json().catch(() => null);
    const parsed = createDailyLogSchema.safeParse(body);
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const authorId = c.get("user")!.userId;
    const log = await createDailyLog(projectId, authorId, parsed.data);
    return success(c, log);
  },
);

// 更新日志
dailyLogRoutes.put("/api/logs/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = updateDailyLogSchema.safeParse(body);
  if (!parsed.success) return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  const result = await updateDailyLog(id, parsed.data);
  if ("error" in result) return error(c, result.error);
  return success(c, result.log);
});

// 删除日志
dailyLogRoutes.delete("/api/logs/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const result = await deleteDailyLog(id);
  if ("error" in result) return error(c, result.error);
  return success(c, null, "已删除");
});
