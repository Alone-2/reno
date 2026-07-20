import { render, screen } from "@testing-library/react";
import { PROJECT_STATUS_LABEL } from "@reno/shared";
import { expect, test } from "vite-plus/test";
import { mockProjectOverview } from "@/mocks/project-overview";
import { OverviewPage } from "./OverviewPage";

test("渲染后出现项目名", () => {
  render(<OverviewPage />);
  expect(
    screen.getByRole("heading", { name: mockProjectOverview.project.name }),
  ).toBeInTheDocument();
});

test("出现至少一条待办标题", () => {
  render(<OverviewPage />);
  expect(screen.getByText(mockProjectOverview.todos[0]!.title)).toBeInTheDocument();
});

test("预算「总预算」与格式化金额可见", () => {
  render(<OverviewPage />);
  expect(screen.getByText("总预算")).toBeInTheDocument();
  expect(screen.getAllByText(/¥/).length).toBeGreaterThanOrEqual(1);
});

test("状态 Chip 中文而非 constructing 原文", () => {
  render(<OverviewPage />);
  const chip = screen.getByTestId("project-status-chip");
  expect(chip).toHaveTextContent(PROJECT_STATUS_LABEL.constructing);
  expect(chip).not.toHaveTextContent("constructing");
});
