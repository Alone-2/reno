import { Hono } from "hono";
import { success } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { requireProjectPermission } from "../../middleware/project-permission";
import { listChanges } from "./service";

export const changeHistoryRoutes = new Hono();

changeHistoryRoutes.get(
  "/api/projects/:id/change-history",
  requireAuth,
  requireProjectPermission("view"),
  async (c) => success(c, await listChanges(c.req.param("id"))),
);
