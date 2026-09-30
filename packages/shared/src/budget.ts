/**
 * 预算计算 — 对齐 PRD §2.6
 * 金额单位：分（integer）
 */

import type { BudgetHealth, MaterialStatus } from "./enums/index.js";

/** 计入实际花费的建材状态 */
export const MATERIAL_STATUS_COUNTS_AS_SPENT: readonly MaterialStatus[] = [
  "ordered",
  "arrived",
  "installed",
] as const;

export const BUDGET_WARN_RATIO = 0.8;
export const BUDGET_OVER_RATIO = 1.0;

export interface BudgetMaterialLine {
  plannedQty: number;
  estimatedUnitPrice: number;
  actualUnitPrice: number | null;
  status: MaterialStatus;
}

export interface BudgetPaymentLine {
  payableAmount: number;
  paidAmount: number;
}

export interface BudgetSummary {
  totalBudget: number;
  /** 已经发生且不重复的支出。 */
  actualSpent: number;
  /** 当前计划中尚未发生的支出：待购材料 + 款项未付部分。 */
  remainingCommitted: number;
  /** actualSpent + remainingCommitted。 */
  forecastTotal: number;
  /** totalBudget - actualSpent。 */
  cashRemaining: number;
  /** totalBudget - forecastTotal。 */
  availableBudget: number;
  spendRatio: number;
  forecastRatio: number;
  /** @deprecated r1.6 兼容：等同 forecastTotal。 */
  budgetCommitted: number;
  /** @deprecated r1.6 兼容：等同 cashRemaining。 */
  budgetRemaining: number;
  /** @deprecated r1.6 兼容：等同 forecastRatio。 */
  commitRatio: number;
}

export function materialEstimatedTotal(line: BudgetMaterialLine): number {
  return Math.round(line.plannedQty * line.estimatedUnitPrice);
}

export function materialActualTotal(line: BudgetMaterialLine): number {
  if (!MATERIAL_STATUS_COUNTS_AS_SPENT.includes(line.status)) return 0;
  if (line.actualUnitPrice == null) return 0;
  return Math.round(line.plannedQty * line.actualUnitPrice);
}

export function sumMaterialEstimated(lines: readonly BudgetMaterialLine[]): number {
  return lines.reduce((s, l) => s + materialEstimatedTotal(l), 0);
}

export function sumMaterialActual(lines: readonly BudgetMaterialLine[]): number {
  return lines.reduce((s, l) => s + materialActualTotal(l), 0);
}

export function sumPaymentPayable(lines: readonly BudgetPaymentLine[]): number {
  return lines.reduce((s, l) => s + l.payableAmount, 0);
}

export function sumPaymentPaid(lines: readonly BudgetPaymentLine[]): number {
  return lines.reduce((s, l) => s + l.paidAmount, 0);
}

export function computeBudgetSummary(
  totalBudget: number,
  materials: readonly BudgetMaterialLine[],
  payments: readonly BudgetPaymentLine[],
): BudgetSummary {
  const materialActual = sumMaterialActual(materials);
  const paymentPaid = sumPaymentPaid(payments);
  const actualSpent = materialActual + paymentPaid;
  const pendingMaterials = materials
    .filter((line) => line.status === "todo")
    .reduce((sum, line) => sum + materialEstimatedTotal(line), 0);
  const unpaidPayments = payments.reduce(
    (sum, line) => sum + Math.max(line.payableAmount - line.paidAmount, 0),
    0,
  );
  const remainingCommitted = pendingMaterials + unpaidPayments;
  const forecastTotal = actualSpent + remainingCommitted;
  const cashRemaining = totalBudget - actualSpent;
  const availableBudget = totalBudget - forecastTotal;
  const spendRatio = totalBudget > 0 ? actualSpent / totalBudget : 0;
  const forecastRatio = totalBudget > 0 ? forecastTotal / totalBudget : 0;
  return {
    totalBudget,
    actualSpent,
    remainingCommitted,
    forecastTotal,
    cashRemaining,
    availableBudget,
    spendRatio,
    forecastRatio,
    budgetCommitted: forecastTotal,
    budgetRemaining: cashRemaining,
    commitRatio: forecastRatio,
  };
}

/**
 * 健康度：
 * - over: 实际花费率 ≥ 100%
 * - forecast_over: 实际未超，但预测总额 ≥ 预算
 * - warn: 80% ≤ 实际花费率 < 100%，且预测未超
 * - ok: 其他
 */
export function budgetHealth(summary: BudgetSummary): BudgetHealth {
  if (summary.spendRatio >= BUDGET_OVER_RATIO) return "over";
  if (summary.forecastRatio >= BUDGET_OVER_RATIO) return "forecast_over";
  if (summary.spendRatio >= BUDGET_WARN_RATIO) return "warn";
  return "ok";
}

/** 分 → 元（展示用，保留 2 位） */
export function fenToYuan(fen: number): number {
  return Math.round(fen) / 100;
}

/** 元 → 分 */
export function yuanToFen(yuan: number): number {
  return Math.round(yuan * 100);
}
