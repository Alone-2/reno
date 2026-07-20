/**
 * 中文展示文案 — UI Chip / 下拉
 */

import type {
  BudgetHealth,
  InspectionItemStatus,
  MaterialStatus,
  NoteStatus,
  PaymentStatus,
  ProjectStatus,
  ProjectType,
  StageStatus,
} from "./enums/index.js";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: "规划中",
  purchasing: "采购中",
  constructing: "施工中",
  accepting: "验收中",
  done: "已完工",
  archived: "已归档",
};

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  full: "全包",
  half: "半包",
  clear: "清包",
};

export const MATERIAL_STATUS_LABEL: Record<MaterialStatus, string> = {
  todo: "待购",
  bought: "已购",
  arrived: "已到货",
  installed: "已安装",
};

export const STAGE_STATUS_LABEL: Record<StageStatus, string> = {
  pending: "未开始",
  ongoing: "进行中",
  done: "已完成",
};

export const NOTE_STATUS_LABEL: Record<NoteStatus, string> = {
  todo: "待确认",
  confirmed: "已确认",
  need_fix: "需整改",
  done: "已完成",
};

export const INSPECTION_ITEM_STATUS_LABEL: Record<InspectionItemStatus, string> = {
  pending: "待验收",
  passed: "通过",
  failed: "不通过",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "待付",
  partial: "部分付",
  paid: "已付清",
};

export const BUDGET_HEALTH_LABEL: Record<BudgetHealth, string> = {
  ok: "正常",
  warn: "接近预算",
  over: "已超支",
  committed_full: "预算已排满",
};

/** Nest 语义：映射到 UI severity */
export const BUDGET_HEALTH_SEVERITY: Record<BudgetHealth, "ok" | "warn" | "danger" | "info"> = {
  ok: "ok",
  warn: "warn",
  over: "danger",
  committed_full: "warn",
};
