import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import { renoApi, type ApiPhase } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";
import { ProgressPage } from "./domain-pages";

const PROJECT_ID = "project-a";
const phases: ApiPhase[] = [
  {
    id: "phase-1",
    projectId: PROJECT_ID,
    phaseName: "拆改",
    sortOrder: 1,
    status: "done",
    standardPhaseKey: "demolition",
    isPrimaryCurrent: false,
    isAcceptanceRequired: true,
    progressPercent: 100,
    plannedStart: "2026-07-01",
    plannedEnd: "2026-07-10",
    actualStart: "2026-07-01",
    actualEnd: "2026-07-09",
  },
  {
    id: "phase-2",
    projectId: PROJECT_ID,
    phaseName: "木作安装",
    sortOrder: 2,
    status: "ongoing",
    standardPhaseKey: "carpentry_customization",
    isPrimaryCurrent: true,
    isAcceptanceRequired: true,
    progressPercent: 45,
    plannedStart: "2026-08-01",
    plannedEnd: "2026-08-20",
    actualStart: "2026-08-01",
    actualEnd: null,
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
  useProjectSession.setState({ currentProjectId: PROJECT_ID });
  vi.spyOn(renoApi, "phases").mockResolvedValue(phases);
  vi.spyOn(renoApi, "logs").mockResolvedValue([]);
  vi.spyOn(renoApi, "photos").mockResolvedValue([]);
});

test("阶段名和后端状态映射为中文", async () => {
  render(<ProgressPage />);

  expect((await screen.findAllByText("木作安装")).length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText("拆改").length).toBeGreaterThanOrEqual(1);
  expect(screen.getByText("进行中")).toBeInTheDocument();
  expect(screen.getByText("已完成")).toBeInTheDocument();
  expect(screen.getByText("当前主阶段")).toBeInTheDocument();
});

test("同时加载阶段、施工日志和现场照片", async () => {
  render(<ProgressPage />);
  await screen.findAllByText("木作安装");

  expect(renoApi.phases).toHaveBeenCalledWith(PROJECT_ID);
  expect(renoApi.logs).toHaveBeenCalledWith(PROJECT_ID);
  expect(renoApi.photos).toHaveBeenCalledWith(PROJECT_ID);
});

test("提供施工日志和现场照片录入入口", async () => {
  render(<ProgressPage />);
  await screen.findAllByText("木作安装");

  expect(screen.getByRole("heading", { name: "记施工日志" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "保存日志" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "关联现场照片" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "保存照片" })).toBeInTheDocument();
});
