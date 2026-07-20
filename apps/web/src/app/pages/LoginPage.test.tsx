import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, test } from "vite-plus/test";
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
  useAuthSession.setState({ user: null });
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
  expect(useAuthSession.getState().user?.username).toBe("alice");
});

test("空密码不进入已登录", async () => {
  const user = userEvent.setup();
  renderLogin();
  await user.type(screen.getByLabelText("用户名"), "alice");
  await user.click(screen.getByRole("button", { name: "登录" }));
  expect(useAuthSession.getState().user).toBeNull();
  expect(screen.getByRole("alert")).toHaveTextContent(/密码/);
});
