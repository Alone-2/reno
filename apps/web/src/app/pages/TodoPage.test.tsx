import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import { renoApi, type ApiActionItem, type ApiIssue, type ApiTodo } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";
import { TodoPage } from "./TodoPage";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const action: ApiActionItem = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  projectId: PROJECT_ID,
  type: "task",
  priority: "high",
  status: "todo",
  title: "确认厨房插座位置",
  notes: "封槽前确认",
  decisionResult: null,
  dueDate: "2026-09-05",
  spaceId: null,
  stageId: null,
  relatedEntityType: null,
  relatedEntityId: null,
  responsiblePartyId: null,
  completedAt: null,
  createdAt: "2026-09-03T00:00:00.000Z",
  updatedAt: "2026-09-03T00:00:00.000Z",
};
const issue: ApiIssue = {
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  projectId: PROJECT_ID,
  title: "卫生间墙砖空鼓",
  description: "东墙发现两块空鼓",
  severity: "high",
  status: "open",
  sourceType: "manual",
  sourceEntityId: null,
  spaceId: null,
  stageId: null,
  responsiblePartyId: null,
  dueDate: "2026-09-06",
  resolutionNotes: null,
  resolvedAt: null,
  verifiedAt: null,
  createdAt: "2026-09-03T00:00:00.000Z",
  updatedAt: "2026-09-03T00:00:00.000Z",
};
const reminder: ApiTodo = {
  id: "material:m1",
  projectId: PROJECT_ID,
  kind: "material",
  title: "采购乳胶漆",
  subtitle: "3 套 · 主材",
  severity: "info",
  href: "/materials",
  status: "todo",
};

beforeEach(() => {
  vi.restoreAllMocks();
  useProjectSession.setState({ currentProjectId: PROJECT_ID });
  vi.spyOn(renoApi, "actionItems").mockResolvedValue([action]);
  vi.spyOn(renoApi, "issues").mockResolvedValue([issue]);
  vi.spyOn(renoApi, "todos").mockResolvedValue([reminder]);
  vi.spyOn(renoApi, "updateActionItemStatus").mockResolvedValue({ ...action, status: "done" });
  vi.spyOn(renoApi, "updateIssueStatus").mockResolvedValue({ ...issue, status: "fixing" });
  vi.spyOn(renoApi, "createActionItem").mockResolvedValue(action);
  vi.spyOn(renoApi, "createIssue").mockResolvedValue(issue);
});

test("同时展示手工行动、现场问题和系统派生提醒", async () => {
  render(
    <MemoryRouter>
      <TodoPage />
    </MemoryRouter>,
  );
  expect(await screen.findByText("确认厨房插座位置")).toBeInTheDocument();
  expect(screen.getByText("卫生间墙砖空鼓")).toBeInTheDocument();
  expect(screen.getByText("采购乳胶漆")).toBeInTheDocument();
});

test("可完成行动项并开始处理现场问题", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <TodoPage />
    </MemoryRouter>,
  );
  await screen.findByText("确认厨房插座位置");

  await user.click(screen.getByRole("button", { name: "完成" }));
  expect(renoApi.updateActionItemStatus).toHaveBeenCalledWith(PROJECT_ID, action.id, "done");

  await user.click(screen.getByRole("button", { name: "开始整改" }));
  expect(renoApi.updateIssueStatus).toHaveBeenCalledWith(PROJECT_ID, issue.id, "fixing");
});

test("可创建新的业主行动项", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <TodoPage />
    </MemoryRouter>,
  );
  await screen.findByText("确认厨房插座位置");

  await user.type(screen.getByPlaceholderText("例如：周五前确认厨房插座位置"), "催橱柜商家复尺");
  await user.click(screen.getByRole("button", { name: "保存行动项" }));

  expect(renoApi.createActionItem).toHaveBeenCalledWith(
    PROJECT_ID,
    expect.objectContaining({ title: "催橱柜商家复尺", type: "task", priority: "normal" }),
  );
});
