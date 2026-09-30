import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import { renoApi, type ApiExpense, type ApiPayment } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";
import { CostPage } from "./domain-pages";

const PROJECT_ID = "project-a";
const payments: ApiPayment[] = [
  {
    id: "payment-1",
    projectId: PROJECT_ID,
    title: "水电阶段款",
    payee: "张工",
    payeePartyId: null,
    payableAmount: 20000,
    paidAmount: 10000,
    status: "partial",
    dueDate: "2026-08-10",
    paidAt: null,
    phaseId: null,
    acceptanceId: null,
    paymentCondition: "水电验收通过",
    conditionStatus: "unmet",
    notes: null,
    createdAt: "2026-07-20T00:00:00.000Z",
    updatedAt: "2026-07-20T00:00:00.000Z",
  },
];

const expenses: ApiExpense[] = [
  {
    id: "expense-1",
    projectId: PROJECT_ID,
    category: "施工",
    amount: "12000",
    description: "施工定金",
    date: "2026-07-20T00:00:00.000Z",
    paid: "2026-07-20T00:00:00.000Z",
    invoice: null,
    notes: null,
    createdAt: "2026-07-20T00:00:00.000Z",
    updatedAt: "2026-07-20T00:00:00.000Z",
  },
  {
    id: "expense-2",
    projectId: PROJECT_ID,
    category: "施工",
    amount: 28000,
    description: "中期款（木作）",
    date: "2026-08-20T00:00:00.000Z",
    paid: null,
    invoice: null,
    notes: null,
    createdAt: "2026-07-20T00:00:00.000Z",
    updatedAt: "2026-07-20T00:00:00.000Z",
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
  useProjectSession.setState({ currentProjectId: PROJECT_ID });
  vi.spyOn(renoApi, "expenses").mockResolvedValue(expenses);
  vi.spyOn(renoApi, "payments").mockResolvedValue(payments);
  vi.spyOn(renoApi, "createExpense").mockResolvedValue(expenses[0]!);
  vi.spyOn(renoApi, "createPayment").mockResolvedValue(payments[0]!);
});

test("从 API 展示累计支出、待支付和费用明细", async () => {
  render(<CostPage />);

  expect(await screen.findByText("施工定金")).toBeInTheDocument();
  expect(screen.getByText("中期款（木作）")).toBeInTheDocument();
  expect(screen.getByText("¥22,000")).toBeInTheDocument();
  expect(screen.getByText("水电阶段款")).toBeInTheDocument();
  expect(screen.getAllByText("¥38,000").length).toBeGreaterThanOrEqual(1);
  expect(renoApi.expenses).toHaveBeenCalledWith(PROJECT_ID);
  expect(renoApi.payments).toHaveBeenCalledWith(PROJECT_ID);
});

test("费用付款状态可见", async () => {
  render(<CostPage />);

  await screen.findByText("施工定金");
  expect(screen.getAllByText("已支付").length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText("待支付").length).toBeGreaterThanOrEqual(1);
});

test("提交新增费用后调用 API 并刷新", async () => {
  const user = userEvent.setup();
  render(<CostPage />);
  await screen.findByText("施工定金");

  await user.type(screen.getByLabelText("金额"), "880");
  await user.type(screen.getByLabelText("说明"), "垃圾清运");
  await user.click(screen.getByRole("button", { name: "添加费用" }));

  expect(renoApi.createExpense).toHaveBeenCalledWith(
    PROJECT_ID,
    expect.objectContaining({ amount: "880", description: "垃圾清运" }),
  );
  expect(renoApi.expenses).toHaveBeenCalledTimes(2);
});
