import { expect, test } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

test("Button 渲染子节点为 button 元素", () => {
  render(<Button>点击我</Button>);
  expect(screen.getByRole("button", { name: "点击我" })).toBeInTheDocument();
});

test("Button 默认 variant 应用 primary 类名", () => {
  render(<Button>保存</Button>);
  const btn = screen.getByRole("button", { name: "保存" });
  expect(btn).toHaveClass("bg-primary");
});

test("Button destructive variant 应用危险类名", () => {
  render(<Button variant="destructive">删除</Button>);
  const btn = screen.getByRole("button", { name: "删除" });
  expect(btn).toHaveClass("bg-destructive");
});
