/**
 * 预算计算 — 对齐 PRD §2.6
 * 金额单位：分（integer）
 */

import type { BudgetHealth, MaterialStatus } from "./enums/index.js";

/** 计入实际花费的建材状态 */
export const MATERIAL_STATUS_COUNTS_AS_SPENT: readonly MaterialStatus[] = [
  "bought",
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
  /** Σ 建材预估 + Σ 款项应付 */
  budgetCommitted: number;
  /** Σ 已购建材实际 + Σ 已付 */
  actualSpent: number;
  budgetRemaining: number;
  /** actualSpent / totalBudget；totalBudget=0 时为 0 */
  spendRatio: number;
  /** budgetCommitted / totalBudget */
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
  const budgetCommitted = sumMaterialEstimated(materials) + sumPaymentPayable(payments);
  const actualSpent = sumMaterialActual(materials) + sumPaymentPaid(payments);
  const budgetRemaining = totalBudget - actualSpent;
  const spendRatio = totalBudget > 0 ? actualSpent / totalBudget : 0;
  const commitRatio = totalBudget > 0 ? budgetCommitted / totalBudget : 0;
  return {
    totalBudget,
    budgetCommitted,
    actualSpent,
    budgetRemaining,
    spendRatio,
    commitRatio,
  };
}

/**
 * 健康度：
 * - over: 花费率 ≥ 100%
 * - warn: 80% ≤ 花费率 < 100%
 * - committed_full: 未超支但占用率 ≥ 100%
 * - ok: 其他
 */
export function budgetHealth(summary: BudgetSummary): BudgetHealth {
  if (summary.spendRatio >= BUDGET_OVER_RATIO) return "over";
  if (summary.spendRatio >= BUDGET_WARN_RATIO) return "warn";
  if (summary.commitRatio >= BUDGET_OVER_RATIO) return "committed_full";
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
