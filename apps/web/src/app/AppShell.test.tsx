import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test } from "vite-plus/test";
import { useAuthSession } from "@/stores/auth-session";
import { AppRouter } from "./AppRouter";
import { APP_NAV } from "./nav";

beforeEach(() => {
  useAuthSession.setState({
    user: {
      id: "u1",
      username: "owner",
      displayName: "业主",
      role: "owner",
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    },
  });
});

test("渲染壳后可见 5 个导航文案", () => {
  render(<AppRouter />);
  for (const item of APP_NAV) {
    expect(screen.getAllByRole("link", { name: item.label }).length).toBeGreaterThanOrEqual(1);
  }
});

test("导航到 /materials 后建材区可见", async () => {
  const user = userEvent.setup();
  render(<AppRouter />);
  const links = screen.getAllByRole("link", { name: "建材" });
  await user.click(links[0]!);
  expect(screen.getByRole("heading", { name: "建材" })).toBeInTheDocument();
});

test("当前 Tab 带 aria-current=page", async () => {
  const user = userEvent.setup();
  render(<AppRouter />);
  const costLinks = screen.getAllByRole("link", { name: "成本" });
  await user.click(costLinks[0]!);
  const active = screen.getAllByRole("link", { name: "成本" });
  expect(active.some((el) => el.getAttribute("aria-current") === "page")).toBe(true);
});
