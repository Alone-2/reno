/**
 * 领域枚举 — 对齐 PRD r1.7 §2.5。
 * 前后端 / 前端表单共用，禁止在 apps 内另写一套目标字面量。
 */

// ── 项目 ──────────────────────────────────────────────

/** 项目状态：采购与施工进度不再占用项目生命周期状态。 */
export const PROJECT_STATUS = ["planning", "active", "accepting", "done", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];

/** 装修承包方式 */
export const PROJECT_TYPES = ["full", "half", "clear"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

// ── 建材 ──────────────────────────────────────────────

/** 采购状态：todo → ordered → arrived → installed；退货/取消为分支终态。 */
export const MATERIAL_STATUS = [
  "todo",
  "ordered",
  "arrived",
  "installed",
  "returned",
  "cancelled",
] as const;
export type MaterialStatus = (typeof MATERIAL_STATUS)[number];

// ── 施工阶段 ──────────────────────────────────────────

export const STAGE_STATUS = ["pending", "ongoing", "done"] as const;
export type StageStatus = (typeof STAGE_STATUS)[number];

// ── 注意事项 ──────────────────────────────────────────

export const NOTE_STATUS = ["todo", "confirmed", "need_fix", "done"] as const;
export type NoteStatus = (typeof NOTE_STATUS)[number];

// ── 业主行动待办 / 决策 ──────────────────────────────

export const ACTION_ITEM_TYPES = [
  "task",
  "decision",
  "follow_up",
  "purchase",
  "payment",
  "recheck",
] as const;
export type ActionItemType = (typeof ACTION_ITEM_TYPES)[number];

export const ACTION_ITEM_STATUS = ["todo", "doing", "done", "cancelled"] as const;
export type ActionItemStatus = (typeof ACTION_ITEM_STATUS)[number];

export const ACTION_ITEM_PRIORITY = ["low", "normal", "high", "urgent"] as const;
export type ActionItemPriority = (typeof ACTION_ITEM_PRIORITY)[number];

// ── 现场问题 ──────────────────────────────────────────

export const ISSUE_STATUS = ["open", "fixing", "resolved", "verified"] as const;
export type IssueStatus = (typeof ISSUE_STATUS)[number];

export const ISSUE_SEVERITY = ["low", "medium", "high", "critical"] as const;
export type IssueSeverity = (typeof ISSUE_SEVERITY)[number];

export const ISSUE_SOURCE_TYPES = ["manual", "daily_log", "acceptance"] as const;
export type IssueSourceType = (typeof ISSUE_SOURCE_TYPES)[number];

// ── 项目联系人 ────────────────────────────────────────

export const PARTY_TYPES = [
  "contractor",
  "foreman",
  "worker",
  "designer",
  "supplier",
  "installer",
  "other",
] as const;
export type PartyType = (typeof PARTY_TYPES)[number];

// ── 验收 ──────────────────────────────────────────────

export const INSPECTION_ITEM_STATUS = ["pending", "passed", "failed"] as const;
export type InspectionItemStatus = (typeof INSPECTION_ITEM_STATUS)[number];

// ── 款项 ──────────────────────────────────────────────

export const PAYMENT_STATUS = ["pending", "partial", "paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

/** 款项对象（MVP） */
export const PAYMENT_PAYEE_TYPES = ["contractor", "designer", "supplier", "other"] as const;
export type PaymentPayeeType = (typeof PAYMENT_PAYEE_TYPES)[number];

export const PAYMENT_CONDITION_STATUS = ["unknown", "unmet", "met"] as const;
export type PaymentConditionStatus = (typeof PAYMENT_CONDITION_STATUS)[number];

// ── 预算健康度（计算派生，非持久化） ──────────────────

export const BUDGET_HEALTH = ["ok", "warn", "forecast_over", "over"] as const;
export type BudgetHealth = (typeof BUDGET_HEALTH)[number];

// ── 用户（v1 仅业主） ─────────────────────────────────

/** v1 产品角色：仅业主（前端/契约） */
export const USER_ROLES = ["owner"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/**
 * 服务端过渡 RBAC 字面量（含历史多角色）。
 * 产品 v1 仅使用 owner；新代码优先 USER_ROLES。
 */
export const ROLES = ["owner", "contractor", "designer", "inspector", "property", "admin"] as const;
export type Role = (typeof ROLES)[number];
