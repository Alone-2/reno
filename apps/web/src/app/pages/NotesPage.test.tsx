import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test } from "vite-plus/test";
import { MemoryRouter } from "react-router-dom";
import { MOCK_PROJECT_A_ID, MOCK_PROJECT_B_ID } from "@/mocks/project-overview";
import { useProjectSession } from "@/stores/project-session";
import { NotesPage } from "./NotesPage";

function renderPage(initialEntry = "/spaces/notes") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <NotesPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useProjectSession.setState({ currentProjectId: MOCK_PROJECT_A_ID });
});

test("展示装修注意事项和八个施工阶段筛选", () => {
  renderPage();

  expect(screen.getByRole("heading", { name: "装修注意事项" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "水电改造" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "木工定制" })).toBeInTheDocument();
  expect(screen.getByTestId("filtered-note-count")).toHaveTextContent("16");
});

test("支持按施工阶段和风险组合筛选", async () => {
  const user = userEvent.setup();
  renderPage();

  await user.click(screen.getByRole("button", { name: "水电改造" }));
  expect(screen.getByTestId("filtered-note-count")).toHaveTextContent("3");
  expect(screen.getByText("给水改造完成后进行压力和渗漏检查")).toBeInTheDocument();
  expect(screen.queryByText("柜体下单前按最终完成面复尺")).not.toBeInTheDocument();

  await user.selectOptions(screen.getByLabelText("风险等级"), "high");
  expect(screen.getByTestId("filtered-note-count")).toHaveTextContent("3");
});

test("支持从 URL 恢复筛选条件", () => {
  renderPage("/spaces/notes?phase=carpentry_customization&space=主卧");

  expect(screen.getByRole("button", { name: "木工定制" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByLabelText("空间")).toHaveValue("主卧");
  expect(screen.getByText("柜体下单前按最终完成面复尺")).toBeInTheDocument();
  expect(screen.queryByText("橱柜内阀门、滤芯、排水和设备保持可检修")).not.toBeInTheDocument();
});

test("其它项目无数据时显示空状态", () => {
  useProjectSession.setState({ currentProjectId: MOCK_PROJECT_B_ID });
  renderPage();

  expect(screen.getByText("没有符合条件的注意事项")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "清除筛选" })).toBeInTheDocument();
});
