import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import { renoApi, type ApiProject } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";
import { ProjectSwitcher } from "../components/ProjectSwitcher";

const projects: ApiProject[] = [
  {
    id: "project-a",
    ownerId: "owner-1",
    propertyId: "property-1",
    type: "residential",
    status: "active",
    plannedStart: null,
    plannedEnd: null,
    actualStart: null,
    actualEnd: null,
    scope: "望京自住装修",
    depositAmount: null,
    depositStatus: "pending",
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
  },
  {
    id: "project-b",
    ownerId: "owner-1",
    propertyId: "property-2",
    type: "residential",
    status: "planning",
    plannedStart: null,
    plannedEnd: null,
    actualStart: null,
    actualEnd: null,
    scope: "昌平新房规划",
    depositAmount: null,
    depositStatus: "pending",
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
  useProjectSession.setState({ currentProjectId: "" });
  vi.spyOn(renoApi, "projects").mockResolvedValue(projects);
});

test("项目选择器从 API 渲染多个项目并自动选中首项", async () => {
  render(<ProjectSwitcher />);

  const select = await screen.findByTestId("project-select");
  expect(select.querySelectorAll("option")).toHaveLength(2);
  expect(select).toHaveValue("project-a");
  expect(useProjectSession.getState().currentProjectId).toBe("project-a");
  expect(screen.getByText("进行中")).toBeInTheDocument();
});

test("选择项目后同步更新项目会话", async () => {
  const user = userEvent.setup();
  render(<ProjectSwitcher />);
  const select = await screen.findByTestId("project-select");

  await user.selectOptions(select, "project-b");

  expect(useProjectSession.getState().currentProjectId).toBe("project-b");
  expect(select).toHaveValue("project-b");
  expect(screen.getByText("规划中")).toBeInTheDocument();
});

test("项目接口失败时展示错误信息", async () => {
  vi.mocked(renoApi.projects).mockRejectedValueOnce(new Error("项目加载失败"));
  render(<ProjectSwitcher />);

  expect(await screen.findByText("项目加载失败")).toBeInTheDocument();
});
