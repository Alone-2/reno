import { and, eq, isNull } from "drizzle-orm";
import { hash, verify, Algorithm } from "@node-rs/argon2";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { db, refreshSession, user } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type JwtPayload,
} from "../../common/jwt";
import { env } from "../../common/env";
import type { RegisterInput, LoginInput } from "./schema";

// Argon2id 配置
const argon2Config = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export function durationToMs(input: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(input.trim());
  if (!match) throw new Error(`Unsupported duration: ${input}`);
  const value = Number(match[1]);
  const unit = match[2];
  return value * ({ s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit!] ?? 0);
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function hashesEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

async function createSession(payload: JwtPayload, userAgent?: string | null) {
  const sessionId = randomUUID();
  const refreshToken = await signRefreshToken(payload, sessionId);
  await db.insert(refreshSession).values({
    id: sessionId,
    userId: payload.userId,
    tokenHash: hashRefreshToken(refreshToken),
    userAgent: userAgent ?? null,
    expiresAt: new Date(Date.now() + durationToMs(env.JWT_REFRESH_TTL)),
  } as any);
  return refreshToken;
}

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

export async function loginUser(input: LoginInput, userAgent?: string | null) {
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
  const refreshToken = await createSession(payload, userAgent);

  // 返回用户信息（不含密码）
  const { passwordHash: _, ...userWithoutPassword } = found;
  return { user: userWithoutPassword, accessToken, refreshToken };
}

export async function refreshTokens(refreshToken: string) {
  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    return { ok: false as const, error: ErrorCode.TOKEN_INVALID };
  }

  const [session] = await db
    .select()
    .from(refreshSession)
    .where(
      and(
        eq(refreshSession.id, payload.sessionId),
        eq(refreshSession.userId, payload.userId),
        isNull(refreshSession.revokedAt),
      ),
    )
    .limit(1);
  if (
    !session ||
    session.expiresAt <= new Date() ||
    !hashesEqual(session.tokenHash, hashRefreshToken(refreshToken))
  ) {
    return { ok: false as const, error: ErrorCode.TOKEN_INVALID };
  }

  const current = await getCurrentUser(payload.userId);
  if ("error" in current) {
    return { ok: false as const, error: current.error };
  }

  const newAccessToken = await signAccessToken(payload);
  const newRefreshToken = await signRefreshToken(payload, payload.sessionId);
  await db
    .update(refreshSession)
    .set({ tokenHash: hashRefreshToken(newRefreshToken), updatedAt: new Date() } as any)
    .where(eq(refreshSession.id, payload.sessionId));
  return {
    ok: true as const,
    user: current.user,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logoutSession(refreshToken: string | undefined) {
  if (!refreshToken) return { success: true };
  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) return { success: true };
  await db
    .update(refreshSession)
    .set({ revokedAt: new Date(), updatedAt: new Date() } as any)
    .where(eq(refreshSession.id, payload.sessionId));
  return { success: true };
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
  await db
    .update(refreshSession)
    .set({ revokedAt: new Date(), updatedAt: new Date() } as any)
    .where(eq(refreshSession.userId, userId));
  return { success: true };
}
