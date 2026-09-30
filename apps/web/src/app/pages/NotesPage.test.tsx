import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import { MemoryRouter } from "react-router-dom";
import { renoApi, type ApiSpace } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";
import { NotesPage } from "./NotesPage";

const PROJECT_ID = "project-a";
const spaces: ApiSpace[] = [
  {
    id: "space-living",
    projectId: PROJECT_ID,
    name: "客厅",
    area: 28,
    notes: null,
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
  },
  {
    id: "space-bedroom",
    projectId: PROJECT_ID,
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
      <NotesPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  useProjectSession.setState({ currentProjectId: PROJECT_ID });
  vi.spyOn(renoApi, "spaces").mockResolvedValue(spaces);
  vi.spyOn(renoApi, "checklist").mockImplementation(async (spaceId) =>
    spaceId === "space-living"
      ? [
          {
            id: "note-1",
            spaceId,
            category: "水电",
            content: "给水改造完成后进行压力和渗漏检查",
            status: "pending",
          },
        ]
      : [
          {
            id: "note-2",
            spaceId,
            category: "木作",
            content: "柜体下单前按最终完成面复尺",
            status: "done",
          },
        ],
  );
});

test("汇总各空间的真实检查清单", async () => {
  renderPage();

  expect(await screen.findByText("给水改造完成后进行压力和渗漏检查")).toBeInTheDocument();
  expect(screen.getByText("柜体下单前按最终完成面复尺")).toBeInTheDocument();
  expect(screen.getByText(/客厅 · 水电 · 待处理/)).toBeInTheDocument();
  expect(renoApi.checklist).toHaveBeenCalledTimes(2);
});

test("没有空间时显示空状态且不请求清单", async () => {
  vi.mocked(renoApi.spaces).mockResolvedValueOnce([]);
  renderPage();

  expect(await screen.findByText("暂无注意事项")).toBeInTheDocument();
  expect(renoApi.checklist).not.toHaveBeenCalled();
});

test("清单请求失败时展示可访问的错误信息", async () => {
  vi.mocked(renoApi.checklist).mockRejectedValueOnce(new Error("清单服务不可用"));
  renderPage();

  expect(await screen.findByRole("alert")).toHaveTextContent("清单服务不可用");
});
