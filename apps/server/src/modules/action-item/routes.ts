import { Hono } from "hono";
import { ErrorCode } from "../../common/error-codes";
import { error, success } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { requireProjectPermission } from "../../middleware/project-permission";
import { actionItemInputSchema, actionItemStatusSchema, updateActionItemSchema } from "./schema";
import {
  changeActionItemStatus,
  createActionItem,
  deleteActionItem,
  listActionItems,
  updateActionItem,
} from "./service";

export const actionItemRoutes = new Hono();

actionItemRoutes.get(
  "/api/projects/:id/action-items",
  requireAuth,
  requireProjectPermission("view"),
  async (c) =>
    success(c, await listActionItems(c.req.param("id"), c.req.query("includeDone") === "true")),
);

actionItemRoutes.post(
  "/api/projects/:id/action-items",
  requireAuth,
  requireProjectPermission("progress.write"),
  async (c) => {
    const parsed = actionItemInputSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const result = await createActionItem(c.req.param("id"), parsed.data, c.get("user")?.userId);
    return success(c, result.item);
  },
);

actionItemRoutes.put(
  "/api/projects/:id/action-items/:itemId",
  requireAuth,
  requireProjectPermission("progress.write"),
  async (c) => {
    const parsed = updateActionItemSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const result = await updateActionItem(
      c.req.param("id"),
      c.req.param("itemId"),
      parsed.data,
      c.get("user")?.userId,
    );
    if ("error" in result) return error(c, result.error);
    return success(c, result.item);
  },
);

actionItemRoutes.put(
  "/api/projects/:id/action-items/:itemId/status",
  requireAuth,
  requireProjectPermission("progress.write"),
  async (c) => {
    const parsed = actionItemStatusSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const result = await changeActionItemStatus(
      c.req.param("id"),
      c.req.param("itemId"),
      parsed.data.status,
      parsed.data.reason,
      c.get("user")?.userId,
    );
    if ("error" in result) return error(c, result.error);
    return success(c, result.item);
  },
);

actionItemRoutes.delete(
  "/api/projects/:id/action-items/:itemId",
  requireAuth,
  requireProjectPermission("progress.write"),
  async (c) => {
    const result = await deleteActionItem(
      c.req.param("id"),
      c.req.param("itemId"),
      c.get("user")?.userId,
    );
    if ("error" in result) return error(c, result.error);
    return success(c, null);
  },
);
