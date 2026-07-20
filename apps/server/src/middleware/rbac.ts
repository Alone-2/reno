import { createMiddleware } from "hono/factory";
import type { Role } from "@reno/shared";
import { ErrorCode } from "../common/error-codes";
import { error } from "../common/response";

// RBAC 角色校验中间件
// 用法: app.post('/api/projects', requireAuth, rbac('owner', 'admin'), handler)
export const rbac = (...allowed: Role[]) =>
  createMiddleware(async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return error(c, ErrorCode.UNAUTHORIZED);
    }
    if (!allowed.includes(user.role as Role)) {
      return error(c, ErrorCode.FORBIDDEN);
    }
    await next();
  });
