import { Hono } from "hono";
import { ErrorCode } from "../../common/error-codes";
import { success, error } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import {
  createSpaceSchema,
  updateSpaceSchema,
  createChecklistItemSchema,
  updateChecklistStatusSchema,
} from "./schema";
import {
  listSpaces,
  createSpace,
  updateSpace,
  deleteSpace,
  listChecklistItems,
  createChecklistItem,
  updateChecklistStatus,
} from "./service";

export const spaceRoutes = new Hono();

// ── 空间 ──

// 获取项目下的空间列表
spaceRoutes.get("/api/projects/:id/spaces", requireAuth, async (c) => {
  const projectId = c.req.param("id");
  const result = await listSpaces(projectId);
  return success(c, result.list);
});

// 创建空间
spaceRoutes.post("/api/projects/:id/spaces", requireAuth, async (c) => {
  const projectId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = createSpaceSchema.safeParse({ ...body, projectId });
  if (!parsed.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  }
  const result = await createSpace(parsed.data);
  return success(c, result.space);
});

// 更新空间
spaceRoutes.put("/api/spaces/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = updateSpaceSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  }
  const result = await updateSpace(id, parsed.data);
  if ("error" in result) return error(c, result.error);
  return success(c, result.space);
});

// 删除空间
spaceRoutes.delete("/api/spaces/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const result = await deleteSpace(id);
  if ("error" in result) return error(c, result.error);
  return success(c, null, "空间已删除");
});

// ── 注意事项 ──

// 获取空间下的注意事项列表
spaceRoutes.get("/api/spaces/:id/checklist", requireAuth, async (c) => {
  const spaceId = c.req.param("id");
  const result = await listChecklistItems(spaceId);
  return success(c, result.list);
});

// 创建注意事项
spaceRoutes.post("/api/spaces/:id/checklist", requireAuth, async (c) => {
  const spaceId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = createChecklistItemSchema.safeParse({ ...body, spaceId });
  if (!parsed.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  }
  const result = await createChecklistItem(parsed.data);
  return success(c, result.checklistItem);
});

// 更新注意事项状态
spaceRoutes.put("/api/checklist/:id/status", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = updateChecklistStatusSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  }
  const result = await updateChecklistStatus(id, parsed.data.status);
  if ("error" in result) return error(c, result.error);
  return success(c, result.checklistItem);
});
