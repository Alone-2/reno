import { Hono } from "hono";
import { ErrorCode } from "../../common/error-codes";
import { success, error, paginated } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { rbac } from "../../middleware/rbac";
import {
  createProjectSchema,
  updateProjectSchema,
  approveProjectSchema,
  queryProjectsSchema,
} from "./schema";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  approveProject,
  deleteProject,
} from "./service";

export const projectRoutes = new Hono();

// 获取项目列表（登录可见全部，未登录隐藏敏感字段）
projectRoutes.get("/api/projects", requireAuth, async (c) => {
  const query = queryProjectsSchema.safeParse(c.req.query());
  if (!query.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, query.error.issues[0]?.message);
  }
  const { status, page, pageSize } = query.data;
  const result = await listProjects(status, page, pageSize);
  return paginated(c, result.list, result.total, result.page, result.pageSize);
});

// 获取项目详情
projectRoutes.get("/api/projects/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const result = await getProject(id);
  if ("error" in result) return error(c, result.error);
  return success(c, result.project);
});

// 创建装修申请（业主或管理员）
projectRoutes.post("/api/projects", requireAuth, rbac("owner", "admin"), async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  }
  const userId = c.get("user")!.userId;
  const result = await createProject(parsed.data, userId);
  return success(c, result.project);
});

// 更新项目
projectRoutes.put("/api/projects/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  }
  const result = await updateProject(id, parsed.data);
  if ("error" in result) return error(c, result.error);
  return success(c, result.project);
});

// 审批项目（物业或管理员）
projectRoutes.post(
  "/api/projects/:id/approve",
  requireAuth,
  rbac("property", "admin"),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => null);
    const parsed = approveProjectSchema.safeParse(body);
    if (!parsed.success) {
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    }
    const result = await approveProject(id, parsed.data);
    if ("error" in result) return error(c, result.error);
    return success(c, result.project);
  },
);

// 取消项目
projectRoutes.delete("/api/projects/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const result = await deleteProject(id);
  if ("error" in result) return error(c, result.error);
  return success(c, null, "项目已删除");
});
