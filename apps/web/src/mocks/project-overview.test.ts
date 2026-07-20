import { expect, test } from "vite-plus/test";
import { MATERIAL_STATUS, PROJECT_STATUS, budgetHealth, computeBudgetSummary } from "@reno/shared";
import {
  getMaterialsForProject,
  getPaymentsForProject,
  getProjectOverview,
  mockProjectOverview,
  mockProjects,
  MOCK_PROJECT_A_ID,
  MOCK_PROJECT_B_ID,
} from "./project-overview";

test("overview.budget.actualSpent 与 materials/payments 重算一致", () => {
  const materials = getMaterialsForProject(MOCK_PROJECT_A_ID);
  const payments = getPaymentsForProject(MOCK_PROJECT_A_ID);
  const project = mockProjects.find((p) => p.id === MOCK_PROJECT_A_ID)!;
  const recomputed = computeBudgetSummary(project.totalBudget, materials, payments);
  expect(mockProjectOverview.budget.actualSpent).toBe(recomputed.actualSpent);
  expect(mockProjectOverview.budget.budgetCommitted).toBe(recomputed.budgetCommitted);
  expect(mockProjectOverview.budget.totalBudget).toBe(project.totalBudget);
});

test("budgetHealth 与 mock 预期一致", () => {
  const expected = budgetHealth(mockProjectOverview.budget);
  expect(mockProjectOverview.budgetHealth).toBe(expected);
});

test("待办 todos.length >= 1", () => {
  expect(mockProjectOverview.todos.length).toBeGreaterThanOrEqual(1);
});

test("mock 状态字面量均在 shared 枚举内", () => {
  for (const p of mockProjects) {
    expect(PROJECT_STATUS).toContain(p.status);
  }
  for (const m of getMaterialsForProject(MOCK_PROJECT_A_ID)) {
    expect(MATERIAL_STATUS).toContain(m.status);
  }
});

test("B 项目 overview 无串数据", () => {
  const b = getProjectOverview(MOCK_PROJECT_B_ID);
  expect(b.project.id).toBe(MOCK_PROJECT_B_ID);
  expect(b.materialCounts.total).toBe(0);
  expect(b.todos).toHaveLength(0);
});
