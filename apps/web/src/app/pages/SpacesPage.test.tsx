import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test } from "vite-plus/test";
import {
  MOCK_PROJECT_A_ID,
  MOCK_PROJECT_B_ID,
  getSpacesForProject,
} from "@/mocks/project-overview";
import { useProjectSession } from "@/stores/project-session";
import { SpacesPage } from "./SpacesPage";

beforeEach(() => {
  useProjectSession.setState({ currentProjectId: MOCK_PROJECT_A_ID });
});

test("有数据时渲染空间名", () => {
  render(<SpacesPage />);
  expect(screen.getByText("客厅")).toBeInTheDocument();
  expect(screen.getByText("主卧")).toBeInTheDocument();
});

test("空列表显示空状态文案", () => {
  render(<SpacesPage empty />);
  expect(screen.getByText(/还没有空间/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "添加空间" })).toBeInTheDocument();
});

test("不展示其它项目空间", () => {
  useProjectSession.setState({ currentProjectId: MOCK_PROJECT_B_ID });
  render(<SpacesPage />);
  expect(getSpacesForProject(MOCK_PROJECT_B_ID)).toHaveLength(0);
  expect(screen.queryByText("客厅")).not.toBeInTheDocument();
  expect(screen.getByText(/还没有空间/)).toBeInTheDocument();
});
