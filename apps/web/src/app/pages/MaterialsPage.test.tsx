import { render, screen } from "@testing-library/react";
import { MATERIAL_STATUS_LABEL } from "@reno/shared";
import { beforeEach, expect, test } from "vite-plus/test";
import { MOCK_PROJECT_A_ID, mockMaterials } from "@/mocks/project-overview";
import { useProjectSession } from "@/stores/project-session";
import { MaterialsPage } from "./domain-pages";

beforeEach(() => {
  useProjectSession.setState({ currentProjectId: MOCK_PROJECT_A_ID });
});

test("渲染 mock 建材名", () => {
  render(<MaterialsPage />);
  expect(screen.getByText("客厅地砖 600×600")).toBeInTheDocument();
});

test("状态为中文「待购」等", () => {
  render(<MaterialsPage />);
  expect(screen.getByText(MATERIAL_STATUS_LABEL.todo)).toBeInTheDocument();
  expect(screen.getByText(MATERIAL_STATUS_LABEL.bought)).toBeInTheDocument();
});

test("已购行显示实际价", () => {
  render(<MaterialsPage />);
  const bought = mockMaterials.find((m) => m.status === "bought")!;
  expect(bought.actualUnitPrice).not.toBeNull();
  expect(screen.getAllByText(/实际/).length).toBeGreaterThanOrEqual(1);
});
