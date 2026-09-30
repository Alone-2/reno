import { expect, test } from "vite-plus/test";
import {
  BUDGET_HEALTH,
  MATERIAL_STATUS,
  PROJECT_STATUS,
  PROJECT_STATUS_LABEL,
  budgetHealth,
  canActionItemTransition,
  canIssueTransition,
  canMaterialTransition,
  canProjectTransition,
  computeBudgetSummary,
  fenToYuan,
  isProjectWritable,
  materialRequiresActualPrice,
  yuanToFen,
  type ProjectStatus,
} from "../src/index.ts";

test("PROJECT_STATUS 对齐 PRD r1.7 五态", () => {
  expect([...PROJECT_STATUS]).toEqual(["planning", "active", "accepting", "done", "archived"]);
});

test("项目状态迁移：planning → active → accepting", () => {
  expect(canProjectTransition("planning", "active")).toBe(true);
  expect(canProjectTransition("active", "accepting")).toBe(true);
  expect(canProjectTransition("accepting", "active")).toBe(true);
  expect(canProjectTransition("planning", "done")).toBe(false);
  expect(canProjectTransition("archived", "planning")).toBe(false);
});

test("归档只读", () => {
  expect(isProjectWritable("archived")).toBe(false);
  expect(isProjectWritable("active")).toBe(true);
});

test("建材采购支持下单、到货、安装及退货分支", () => {
  expect(canMaterialTransition("todo", "ordered")).toBe(true);
  expect(canMaterialTransition("ordered", "arrived")).toBe(true);
  expect(canMaterialTransition("arrived", "installed")).toBe(true);
  expect(canMaterialTransition("installed", "returned")).toBe(true);
  expect(canMaterialTransition("ordered", "todo")).toBe(false);
  expect(canMaterialTransition("ordered", "todo", { allowBackward: true })).toBe(true);
  expect(materialRequiresActualPrice("ordered")).toBe(true);
  expect(materialRequiresActualPrice("todo")).toBe(false);
  expect(materialRequiresActualPrice("cancelled")).toBe(false);
});

test("行动项和现场问题形成可回退闭环", () => {
  expect(canActionItemTransition("todo", "doing")).toBe(true);
  expect(canActionItemTransition("doing", "done")).toBe(true);
  expect(canIssueTransition("open", "fixing")).toBe(true);
  expect(canIssueTransition("fixing", "resolved")).toBe(true);
  expect(canIssueTransition("resolved", "verified")).toBe(true);
  expect(canIssueTransition("open", "verified")).toBe(false);
});

test("预算：默认计算实际、待支出和预测总额", () => {
  const summary = computeBudgetSummary(
    yuanToFen(100_000),
    [
      {
        plannedQty: 10,
        estimatedUnitPrice: yuanToFen(100),
        actualUnitPrice: yuanToFen(120),
        status: "ordered",
      },
      {
        plannedQty: 5,
        estimatedUnitPrice: yuanToFen(200),
        actualUnitPrice: null,
        status: "todo",
      },
    ],
    [{ payableAmount: yuanToFen(50_000), paidAmount: yuanToFen(40_000) }],
  );
  expect(fenToYuan(summary.actualSpent)).toBe(41_200);
  expect(fenToYuan(summary.remainingCommitted)).toBe(11_000);
  expect(fenToYuan(summary.forecastTotal)).toBe(52_200);
  expect(fenToYuan(summary.availableBudget)).toBe(47_800);
  expect(budgetHealth(summary)).toBe("ok");
});

test("实际花费达到 80% 为 warn", () => {
  const summary = computeBudgetSummary(
    yuanToFen(100),
    [
      {
        plannedQty: 1,
        estimatedUnitPrice: yuanToFen(90),
        actualUnitPrice: yuanToFen(85),
        status: "ordered",
      },
    ],
    [],
  );
  expect(summary.spendRatio).toBe(0.85);
  expect(budgetHealth(summary)).toBe("warn");
});

test("实际未超但预测达到预算为 forecast_over", () => {
  const summary = computeBudgetSummary(
    yuanToFen(100),
    [],
    [{ payableAmount: yuanToFen(110), paidAmount: yuanToFen(10) }],
  );
  expect(summary.spendRatio).toBe(0.1);
  expect(summary.forecastRatio).toBe(1.1);
  expect(budgetHealth(summary)).toBe("forecast_over");
});

test("预算实际超支为 over", () => {
  const summary = computeBudgetSummary(
    yuanToFen(100),
    [
      {
        plannedQty: 1,
        estimatedUnitPrice: yuanToFen(100),
        actualUnitPrice: yuanToFen(110),
        status: "installed",
      },
    ],
    [],
  );
  expect(budgetHealth(summary)).toBe("over");
});

test("中文 label 覆盖全部项目状态", () => {
  for (const status of PROJECT_STATUS) {
    expect(PROJECT_STATUS_LABEL[status].length).toBeGreaterThan(0);
  }
  expect(MATERIAL_STATUS).toHaveLength(6);
  expect(BUDGET_HEALTH).toContain("forecast_over");
});

test("项目状态不再暴露物业审批状态", () => {
  const status: ProjectStatus = "planning";
  expect(status).toBe("planning");
  expect((PROJECT_STATUS as readonly string[]).includes("pending")).toBe(false);
  expect((PROJECT_STATUS as readonly string[]).includes("constructing")).toBe(false);
});
