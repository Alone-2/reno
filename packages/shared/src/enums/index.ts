/**
 * 领域枚举 — 对齐 PRD v1.1 §2.5 状态机
 * 前后端 / 前端表单共用，禁止在 apps 内另写一套字面量。
 */

// ── 项目 ──────────────────────────────────────────────

/** 项目状态：planning → purchasing ↔ constructing → accepting → done → archived */
export const PROJECT_STATUS = [
  "planning",
  "purchasing",
  "constructing",
  "accepting",
  "done",
  "archived",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];

/** 装修承包方式 */
export const PROJECT_TYPES = ["full", "half", "clear"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

// ── 建材 ──────────────────────────────────────────────

/** 采购状态：仅允许向前（回退需确认） */
export const MATERIAL_STATUS = ["todo", "bought", "arrived", "installed"] as const;
export type MaterialStatus = (typeof MATERIAL_STATUS)[number];

// ── 施工阶段 ──────────────────────────────────────────

export const STAGE_STATUS = ["pending", "ongoing", "done"] as const;
export type StageStatus = (typeof STAGE_STATUS)[number];

// ── 注意事项 ──────────────────────────────────────────

export const NOTE_STATUS = ["todo", "confirmed", "need_fix", "done"] as const;
export type NoteStatus = (typeof NOTE_STATUS)[number];

// ── 验收 ──────────────────────────────────────────────

export const INSPECTION_ITEM_STATUS = ["pending", "passed", "failed"] as const;
export type InspectionItemStatus = (typeof INSPECTION_ITEM_STATUS)[number];

// ── 款项 ──────────────────────────────────────────────

export const PAYMENT_STATUS = ["pending", "partial", "paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

/** 款项对象（MVP） */
export const PAYMENT_PAYEE_TYPES = ["contractor", "designer", "other"] as const;
export type PaymentPayeeType = (typeof PAYMENT_PAYEE_TYPES)[number];

// ── 预算健康度（计算派生，非持久化） ──────────────────

export const BUDGET_HEALTH = ["ok", "warn", "over", "committed_full"] as const;
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
