import { render, screen } from "@testing-library/react";
import { STAGE_STATUS_LABEL } from "@reno/shared";
import { beforeEach, expect, test } from "vite-plus/test";
import { MOCK_PROJECT_A_ID } from "@/mocks/project-overview";
import { useProjectSession } from "@/stores/project-session";
import { ProgressPage } from "./domain-pages";

beforeEach(() => {
  useProjectSession.setState({ currentProjectId: MOCK_PROJECT_A_ID });
});

test("阶段名可见", () => {
  render(<ProgressPage />);
  expect(screen.getByText("木作安装")).toBeInTheDocument();
  expect(screen.getByText("拆改")).toBeInTheDocument();
});

test("ongoing 有「进行中」", () => {
  render(<ProgressPage />);
  expect(screen.getByText(STAGE_STATUS_LABEL.ongoing)).toBeInTheDocument();
});

test("存在「记施工日志」按钮", () => {
  render(<ProgressPage />);
  expect(screen.getByRole("button", { name: "记施工日志" })).toBeInTheDocument();
});
