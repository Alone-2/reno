import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import { renoApi } from "@/lib/reno-api";
import { useAuthSession } from "@/stores/auth-session";
import { LoginPage } from "./LoginPage";

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  useAuthSession.setState({ user: null, accessToken: null, refreshToken: null });
  vi.spyOn(renoApi, "login").mockResolvedValue({
    user: {
      id: "user-1",
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

test("用户名/密码输入可填", async () => {
  const user = userEvent.setup();
  renderLogin();
  const username = screen.getByLabelText("用户名");
  const password = screen.getByLabelText("密码");
  await user.type(username, "alice");
  await user.type(password, "secret1");
  expect(username).toHaveValue("alice");
  expect(password).toHaveValue("secret1");
});

test("提交后 store 有 user", async () => {
  const user = userEvent.setup();
  renderLogin();
  await user.type(screen.getByLabelText("用户名"), "alice");
  await user.type(screen.getByLabelText("密码"), "secret1");
  await user.click(screen.getByRole("button", { name: "登录" }));
  expect(renoApi.login).toHaveBeenCalledWith("alice", "secret1");
  await waitFor(() => expect(useAuthSession.getState().user?.username).toBe("alice"));
});

test("空密码不进入已登录", async () => {
  const user = userEvent.setup();
  renderLogin();
  await user.type(screen.getByLabelText("用户名"), "alice");
  await user.click(screen.getByRole("button", { name: "登录" }));
  expect(useAuthSession.getState().user).toBeNull();
  expect(screen.getByRole("alert")).toHaveTextContent(/密码/);
});
