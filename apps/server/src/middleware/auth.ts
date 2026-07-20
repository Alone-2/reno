import { createMiddleware } from "hono/factory";
import type { JwtPayload } from "../common/jwt";
import { verifyToken } from "../common/jwt";
import { ErrorCode } from "../common/error-codes";
import { error } from "../common/response";

// 扩展 Hono Context 变量
type Vars = {
  user: JwtPayload | null;
  isAuthenticated: boolean;
};

// ── 可选认证：解析 token，不强制 ──
export const optionalAuth = createMiddleware<{ Variables: Vars }>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      c.set("user", payload);
      c.set("isAuthenticated", true);
    } else {
      c.set("user", null);
      c.set("isAuthenticated", false);
    }
  } else {
    c.set("user", null);
    c.set("isAuthenticated", false);
  }

  await next();
});

// ── 强制认证：必须登录 ──
export const requireAuth = createMiddleware<{ Variables: Vars }>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return error(c, ErrorCode.UNAUTHORIZED);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return error(c, ErrorCode.TOKEN_INVALID);
  }

  c.set("user", payload);
  c.set("isAuthenticated", true);
  await next();
});
