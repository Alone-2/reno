import type { ProjectPermission } from "@reno/db";
import { createMiddleware } from "hono/factory";
import { ErrorCode } from "../common/error-codes";
import { error } from "../common/response";
import { getProjectAccess } from "../modules/member/service";

export const requireProjectPermission = (permission: ProjectPermission, paramName = "id") =>
  createMiddleware(async (c, next) => {
    const currentUser = c.get("user");
    if (!currentUser) return error(c, ErrorCode.UNAUTHORIZED);
    const projectId = c.req.param(paramName);
    const access = await getProjectAccess(currentUser.userId, currentUser.role, projectId);
    if (!access || !access.permissions.includes(permission)) {
      return error(c, ErrorCode.FORBIDDEN);
    }
    c.set("projectAccess", access);
    await next();
  });
