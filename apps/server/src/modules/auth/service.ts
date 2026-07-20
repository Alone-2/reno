import { eq } from "drizzle-orm";
import { hash, verify, Algorithm } from "@node-rs/argon2";
import { db, user } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import { signAccessToken, signRefreshToken, type JwtPayload } from "../../common/jwt";
import type { RegisterInput, LoginInput } from "./schema";

// Argon2id 配置
const argon2Config = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export async function registerUser(input: RegisterInput) {
  // 检查用户名是否已存在
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.username, input.username))
    .limit(1);
  if (existing.length > 0) {
    return { error: ErrorCode.ALREADY_EXISTS };
  }

  const passwordHash = await hash(input.password, argon2Config);
  const [created] = await db
    .insert(user)
    .values({
      username: input.username,
      passwordHash,
      name: input.name ?? null,
      phone: input.phone ?? null,
      role: input.role,
    } as any)
    .returning();

  return { user: created };
}

export async function loginUser(input: LoginInput) {
  const [found] = await db.select().from(user).where(eq(user.username, input.username)).limit(1);

  if (!found) {
    return { error: ErrorCode.LOGIN_FAILED };
  }

  const valid = await verify(found.passwordHash, input.password, argon2Config);
  if (!valid) {
    return { error: ErrorCode.LOGIN_FAILED };
  }

  const payload: JwtPayload = {
    userId: found.id,
    username: found.username,
    role: found.role,
  };

  const accessToken = await signAccessToken(payload);
  const refreshToken = await signRefreshToken(payload);

  // 返回用户信息（不含密码）
  const { passwordHash: _, ...userWithoutPassword } = found;
  return { user: userWithoutPassword, accessToken, refreshToken };
}

export async function refreshTokens(refreshToken: string) {
  // 简化版：验证 refresh token 有效就重新签发
  // TODO: 生产环境应加 rotation（存 DB 记录，刷新即作废旧 token）
  const { verifyToken } = await import("../../common/jwt");
  const payload = await verifyToken(refreshToken);
  if (!payload) {
    return { error: ErrorCode.TOKEN_INVALID };
  }

  const newAccessToken = await signAccessToken(payload);
  const newRefreshToken = await signRefreshToken(payload);
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function getCurrentUser(userId: string) {
  const [found] = await db
    .select({
      id: user.id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!found) {
    return { error: ErrorCode.NOT_FOUND };
  }
  return { user: found };
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  const [found] = await db
    .select({ id: user.id, passwordHash: user.passwordHash })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!found) {
    return { error: ErrorCode.NOT_FOUND };
  }

  const valid = await verify(found.passwordHash, oldPassword, argon2Config);
  if (!valid) {
    return { error: ErrorCode.LOGIN_FAILED };
  }

  const newHash = await hash(newPassword, argon2Config);
  await db.update(user).set({ passwordHash: newHash }).where(eq(user.id, userId));
  return { success: true };
}
