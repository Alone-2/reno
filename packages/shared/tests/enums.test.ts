import { expect, test } from "vite-plus/test";
import {
  BUDGET_HEALTH,
  MATERIAL_STATUS,
  PROJECT_STATUS,
  PROJECT_STATUS_LABEL,
  budgetHealth,
  canMaterialTransition,
  canProjectTransition,
  computeBudgetSummary,
  fenToYuan,
  isProjectWritable,
  materialRequiresActualPrice,
  yuanToFen,
  type ProjectStatus,
} from "../src/index.ts";

test("PROJECT_STATUS 对齐 PRD v1.1 六态", () => {
  expect([...PROJECT_STATUS]).toEqual([
    "planning",
    "purchasing",
    "constructing",
    "accepting",
    "done",
    "archived",
  ]);
});

test("项目状态迁移：planning → purchasing/constructing", () => {
  expect(canProjectTransition("planning", "purchasing")).toBe(true);
  expect(canProjectTransition("planning", "constructing")).toBe(true);
  expect(canProjectTransition("planning", "done")).toBe(false);
  expect(canProjectTransition("archived", "planning")).toBe(false);
});

test("归档只读", () => {
  expect(isProjectWritable("archived")).toBe(false);
  expect(isProjectWritable("constructing")).toBe(true);
});

test("建材状态默认只前进", () => {
  expect(canMaterialTransition("todo", "bought")).toBe(true);
  expect(canMaterialTransition("bought", "todo")).toBe(false);
  expect(canMaterialTransition("bought", "todo", { allowBackward: true })).toBe(true);
  expect(materialRequiresActualPrice("bought")).toBe(true);
  expect(materialRequiresActualPrice("todo")).toBe(false);
});

test("预算：实际花费与健康度", () => {
  const summary = computeBudgetSummary(
    yuanToFen(100_000),
    [
      {
        plannedQty: 10,
        estimatedUnitPrice: yuanToFen(100),
        actualUnitPrice: yuanToFen(120),
        status: "bought",
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
  // 建材预估 10*100 + 5*200 = 2000 元；款项应付 5万
  expect(fenToYuan(summary.budgetCommitted)).toBe(52_000);
  // 实际：10*120 + 4万 = 41200
  expect(fenToYuan(summary.actualSpent)).toBe(41_200);
  expect(budgetHealth(summary)).toBe("ok");
});

test("预算接近 80% 为 warn", () => {
  const summary = computeBudgetSummary(
    yuanToFen(100),
    [
      {
        plannedQty: 1,
        estimatedUnitPrice: yuanToFen(90),
        actualUnitPrice: yuanToFen(85),
        status: "bought",
      },
    ],
    [],
  );
  expect(summary.spendRatio).toBe(0.85);
  expect(budgetHealth(summary)).toBe("warn");
});

test("预算超支为 over", () => {
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
  for (const s of PROJECT_STATUS) {
    expect(PROJECT_STATUS_LABEL[s].length).toBeGreaterThan(0);
  }
  expect(MATERIAL_STATUS).toHaveLength(4);
  expect(BUDGET_HEALTH).toContain("committed_full");
});

test("旧 Role 类型不应再导出多角色（编译期靠 enum；运行检查无 contractor）", () => {
  const status: ProjectStatus = "planning";
  expect(status).toBe("planning");
  // 确保未再导出 contractor 等旧角色到 PROJECT_STATUS
  expect((PROJECT_STATUS as readonly string[]).includes("pending")).toBe(false);
});
