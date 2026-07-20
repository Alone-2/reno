import { Hono } from "hono";
import { ErrorCode } from "../../common/error-codes";
import { success, error } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { rbac } from "../../middleware/rbac";
import {
  createInspectionSchema,
  createViolationSchema,
  updateViolationStatusSchema,
} from "./schema";
import {
  listInspections,
  createInspection,
  listViolations,
  createViolation,
  updateViolationStatus,
} from "./service";

export const inspectionRoutes = new Hono();

// ── 巡检 ──
inspectionRoutes.get("/api/projects/:id/inspections", requireAuth, async (c) => {
  const projectId = c.req.param("id");
  const items = await listInspections(projectId);
  return success(c, items);
});

inspectionRoutes.post(
  "/api/inspections",
  requireAuth,
  rbac("inspector", "property", "admin"),
  async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = createInspectionSchema.safeParse(body);
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const inspectorId = c.get("user")!.userId;
    const item = await createInspection(inspectorId, parsed.data);
    return success(c, item);
  },
);

// ── 违规 ──
inspectionRoutes.get("/api/projects/:id/violations", requireAuth, async (c) => {
  const projectId = c.req.param("id");
  const items = await listViolations(projectId);
  return success(c, items);
});

inspectionRoutes.post(
  "/api/violations",
  requireAuth,
  rbac("inspector", "property", "admin"),
  async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = createViolationSchema.safeParse(body);
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const item = await createViolation(parsed.data);
    return success(c, item);
  },
);

inspectionRoutes.put(
  "/api/violations/:id/status",
  requireAuth,
  rbac("inspector", "property", "admin"),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => null);
    const parsed = updateViolationStatusSchema.safeParse(body);
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const result = await updateViolationStatus(id, parsed.data.status);
    if ("error" in result) return error(c, result.error);
    return success(c, result.violation);
  },
);
