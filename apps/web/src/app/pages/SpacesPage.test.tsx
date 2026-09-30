import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import { MemoryRouter } from "react-router-dom";
import { renoApi, type ApiSpace } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";
import { SpacesPage } from "./SpacesPage";

const PROJECT_A_ID = "project-a";
const PROJECT_B_ID = "project-b";
const spaces: ApiSpace[] = [
  {
    id: "space-living-room",
    projectId: PROJECT_A_ID,
    name: "客厅",
    area: "28.5",
    notes: "预留扫地机器人插座",
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
  },
  {
    id: "space-bedroom",
    projectId: PROJECT_A_ID,
    name: "主卧",
    area: 16,
    notes: null,
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <SpacesPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  useProjectSession.setState({ currentProjectId: PROJECT_A_ID });
  vi.spyOn(renoApi, "spaces").mockResolvedValue(spaces);
  vi.spyOn(renoApi, "createSpace").mockResolvedValue(spaces[0]!);
});

test("从 API 加载并渲染空间", async () => {
  renderPage();

  expect(await screen.findByText("客厅")).toBeInTheDocument();
  expect(screen.getByText("主卧")).toBeInTheDocument();
  expect(renoApi.spaces).toHaveBeenCalledWith(PROJECT_A_ID);
});

test("空列表显示空状态文案", async () => {
  vi.mocked(renoApi.spaces).mockResolvedValueOnce([]);
  renderPage();

  expect(await screen.findByText("暂无空间")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "添加空间" })).toBeInTheDocument();
});

test("切换项目后只请求当前项目空间", async () => {
  useProjectSession.setState({ currentProjectId: PROJECT_B_ID });
  vi.mocked(renoApi.spaces).mockResolvedValueOnce([]);
  renderPage();

  expect(await screen.findByText("暂无空间")).toBeInTheDocument();
  expect(renoApi.spaces).toHaveBeenCalledWith(PROJECT_B_ID);
  expect(screen.queryByText("客厅")).not.toBeInTheDocument();
});
