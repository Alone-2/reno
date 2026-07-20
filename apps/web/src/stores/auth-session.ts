import { create } from "zustand";
import type { User } from "@reno/shared";

interface AuthState {
  user: User | null;
  login: (username: string, password: string) => { ok: true } | { ok: false; message: string };
  logout: () => void;
}

const MOCK_USER: User = {
  id: "00000000-0000-4000-8000-000000000001",
  username: "owner",
  displayName: "业主小王",
  role: "owner",
  createdAt: "2026-07-18T10:00:00.000Z",
  updatedAt: "2026-07-18T10:00:00.000Z",
};

/** mock 登录：任意非空用户名 + 密码长度 ≥ 6 */
export const useAuthSession = create<AuthState>((set) => ({
  user: null,
  login: (username, password) => {
    if (!username.trim()) {
      return { ok: false, message: "请输入用户名" };
    }
    if (!password || password.length < 6) {
      return { ok: false, message: "密码至少 6 位" };
    }
    set({
      user: {
        ...MOCK_USER,
        username: username.trim(),
        displayName: username.trim(),
      },
    });
    return { ok: true };
  },
  logout: () => set({ user: null }),
}));
