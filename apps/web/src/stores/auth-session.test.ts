import { beforeEach, expect, test, vi } from "vite-plus/test";
import { renoApi } from "@/lib/reno-api";
import { useAuthSession } from "./auth-session";

const STORAGE_KEY = "reno-auth-session";

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  useAuthSession.setState({ user: null, accessToken: null, refreshToken: null });
  vi.spyOn(renoApi, "login").mockResolvedValue({
    user: {
      id: "u1",
      username: "alice",
      displayName: "Alice",
      role: "owner",
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    },
    accessToken: "access-token",
    refreshToken: "refresh-token",
  });
});

test("登录后持久化用户但不保存密码", async () => {
  const result = await useAuthSession.getState().login("alice", "secret1");

  expect(result.ok).toBe(true);
  const stored = localStorage.getItem(STORAGE_KEY);
  expect(stored).toContain("alice");
  expect(stored).not.toContain("secret1");
});

test("页面重新加载时可以恢复登录用户", async () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      state: {
        user: {
          id: "u1",
          username: "owner",
          displayName: "业主",
          role: "owner",
          createdAt: "2026-07-18T00:00:00.000Z",
          updatedAt: "2026-07-18T00:00:00.000Z",
        },
      },
      version: 2,
    }),
  );

  await useAuthSession.persist.rehydrate();

  expect(useAuthSession.getState().user?.username).toBe("owner");
});

test("退出登录同步清除持久化用户", async () => {
  await useAuthSession.getState().login("alice", "secret1");

  useAuthSession.getState().logout();

  expect(useAuthSession.getState().user).toBeNull();
  expect(localStorage.getItem(STORAGE_KEY)).not.toContain("alice");
});
