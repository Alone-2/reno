import { Hono } from "hono";
import { success } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { requireProjectPermission } from "../../middleware/project-permission";
import { listTodos } from "./service";

export const todoRoutes = new Hono();

todoRoutes.get(
  "/api/projects/:id/todos",
  requireAuth,
  requireProjectPermission("view"),
  async (c) => success(c, await listTodos(c.req.param("id"))),
);
