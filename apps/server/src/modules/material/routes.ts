import { Hono } from "hono";
import { ErrorCode } from "../../common/error-codes";
import { success, error } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { filterSensitive } from "../../common/sensitive";
import {
  createMaterialSchema,
  updateMaterialSchema,
  createExpenseSchema,
  updateExpenseSchema,
} from "./schema";
import {
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "./service";

export const materialRoutes = new Hono();

// ── 材料路由 ──

// 获取项目材料列表（登录可见全部，未登录隐藏金额）
materialRoutes.get("/api/projects/:id/materials", requireAuth, async (c) => {
  const projectId = c.req.param("id");
  const result = await listMaterials(projectId);
  const isAuthenticated = c.get("isAuthenticated") ?? false;
  const filtered = filterSensitive(result.list, isAuthenticated);
  return success(c, filtered);
});

// 创建材料
materialRoutes.post("/api/projects/:id/materials", requireAuth, async (c) => {
  const projectId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = createMaterialSchema.safeParse({ ...body, projectId });
  if (!parsed.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  }
  const result = await createMaterial(parsed.data);
  return success(c, result.material);
});

// 更新材料
materialRoutes.put("/api/materials/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = updateMaterialSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  }
  const result = await updateMaterial(id, parsed.data);
  if ("error" in result) return error(c, result.error);
  return success(c, result.material);
});

// 删除材料
materialRoutes.delete("/api/materials/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const result = await deleteMaterial(id);
  if ("error" in result) return error(c, result.error);
  return success(c, null, "材料已删除");
});

// ── 费用路由 ──

// 获取项目费用列表
materialRoutes.get("/api/projects/:id/expenses", requireAuth, async (c) => {
  const projectId = c.req.param("id");
  const result = await listExpenses(projectId);
  const isAuthenticated = c.get("isAuthenticated") ?? false;
  const filtered = filterSensitive(result.list, isAuthenticated);
  return success(c, filtered);
});

// 创建费用
materialRoutes.post("/api/projects/:id/expenses", requireAuth, async (c) => {
  const projectId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = createExpenseSchema.safeParse({ ...body, projectId });
  if (!parsed.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  }
  const result = await createExpense(parsed.data);
  return success(c, result.expense);
});

// 更新费用
materialRoutes.put("/api/expenses/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = updateExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  }
  const result = await updateExpense(id, parsed.data);
  if ("error" in result) return error(c, result.error);
  return success(c, result.expense);
});

// 删除费用
materialRoutes.delete("/api/expenses/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const result = await deleteExpense(id);
  if ("error" in result) return error(c, result.error);
  return success(c, null, "费用已删除");
});
