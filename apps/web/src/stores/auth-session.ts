import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "@reno/shared";
import { configureApiAuth } from "@/lib/api-client";
import { renoApi, type ApiUser } from "@/lib/reno-api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => void;
}

function normalizeUser(input: ApiUser): User {
  return {
    id: input.id,
    username: input.username,
    displayName: input.displayName ?? input.name ?? input.username,
    role: input.role as User["role"],
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export const useAuthSession = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      login: async (username, password) => {
        if (!username.trim()) return { ok: false, message: "请输入用户名" };
        if (!password || password.length < 6) return { ok: false, message: "密码至少 6 位" };
        try {
          const result = await renoApi.login(username.trim(), password);
          set({
            user: normalizeUser(result.user),
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            message: error instanceof Error ? error.message : "登录失败，请稍后重试",
          };
        }
      },
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: "reno-auth-session",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

configureApiAuth({
  getAccessToken: () => useAuthSession.getState().accessToken,
  onUnauthorized: () => useAuthSession.getState().logout(),
});
