import { Hono } from "hono";
import { env } from "../../common/env";
import { ErrorCode } from "../../common/error-codes";
import { success, error } from "../../common/response";
import { registerSchema, loginSchema, changePasswordSchema } from "./schema";
import { registerUser, loginUser, refreshTokens, getCurrentUser, changePassword } from "./service";
import { requireAuth } from "../../middleware/auth";

export const authRoutes = new Hono();

// 注册
authRoutes.post("/api/auth/register", async (c) => {
  if (!env.ENABLE_REGISTRATION) {
    return error(c, ErrorCode.REGISTRATION_DISABLED);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  }

  const result = await registerUser(parsed.data);
  if ("error" in result) {
    return error(c, result.error);
  }

  // 注册成功后自动登录
  const loginResult = await loginUser({
    username: parsed.data.username,
    password: parsed.data.password,
  });
  if ("error" in loginResult) {
    return error(c, loginResult.error);
  }

  return success(c, loginResult);
});

// 登录
authRoutes.post("/api/auth/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  }

  const result = await loginUser(parsed.data);
  if ("error" in result) {
    return error(c, result.error);
  }

  return success(c, result);
});

// 刷新 Token
authRoutes.post("/api/auth/token/refresh", async (c) => {
  const body = await c.req.json().catch(() => null);
  const refreshToken = body?.refreshToken;
  if (!refreshToken) {
    return error(c, ErrorCode.TOKEN_INVALID);
  }

  const result = await refreshTokens(refreshToken);
  if ("error" in result) {
    return error(c, result.error);
  }

  return success(c, result);
});

// 获取当前用户
authRoutes.get("/api/auth/me", requireAuth, async (c) => {
  const userId = c.get("user")!.userId;
  const result = await getCurrentUser(userId);
  if ("error" in result) {
    return error(c, result.error);
  }
  return success(c, result.user);
});

// 修改密码
authRoutes.put("/api/auth/password", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  }

  const userId = c.get("user")!.userId;
  const result = await changePassword(userId, parsed.data.oldPassword, parsed.data.newPassword);
  if ("error" in result) {
    return error(c, result.error);
  }

  return success(c, null, "密码修改成功");
});
