import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

export interface RefreshJwtPayload extends JwtPayload {
  sessionId: string;
}

// 签发 Access Token
export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_TTL)
    .sign(secret);
}

// 签发 Refresh Token
export async function signRefreshToken(payload: JwtPayload, sessionId: string): Promise<string> {
  return new SignJWT({ ...payload, sessionId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_TTL)
    .sign(secret);
}

// 验证 Token
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== "access") return null;
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== "refresh" || typeof payload.sessionId !== "string") return null;
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
      sessionId: payload.sessionId,
    };
  } catch {
    return null;
  }
}
