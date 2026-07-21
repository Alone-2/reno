import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test } from "vite-plus/test";
import { MemoryRouter } from "react-router-dom";
import { AppShell } from "../AppShell";
import { OverviewRoute } from "./OverviewRoute";
import { MOCK_PROJECT_A_ID, MOCK_PROJECT_B_ID, mockProjects } from "@/mocks/project-overview";
import { useProjectSession } from "@/stores/project-session";
import { Route, Routes } from "react-router-dom";

function renderOverview() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<OverviewRoute />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useProjectSession.setState({ currentProjectId: MOCK_PROJECT_A_ID });
});

test("项目选择器渲染 ≥2 项目", () => {
  renderOverview();
  expect(mockProjects.length).toBeGreaterThanOrEqual(2);
  expect(screen.getByTestId("project-select").querySelectorAll("option").length).toBe(
    mockProjects.length,
  );
});

test("选择项目后 store 与选择值变化", async () => {
  const user = userEvent.setup();
  renderOverview();
  const select = screen.getByTestId("project-select");
  await user.selectOptions(select, MOCK_PROJECT_B_ID);
  expect(useProjectSession.getState().currentProjectId).toBe(MOCK_PROJECT_B_ID);
  expect(select).toHaveValue(MOCK_PROJECT_B_ID);
});

test("总览标题随当前项目变", async () => {
  const user = userEvent.setup();
  renderOverview();
  expect(screen.getByRole("heading", { name: "望京自住装修" })).toBeInTheDocument();
  await user.selectOptions(screen.getByTestId("project-select"), MOCK_PROJECT_B_ID);
  expect(screen.getByRole("heading", { name: "昌平新房规划" })).toBeInTheDocument();
});
