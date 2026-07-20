import { pgEnum } from "drizzle-orm/pg-core";

// ── 用户角色 ──
export const roleEnum = pgEnum("role", [
  "owner", // 业主
  "contractor", // 装修公司/工长
  "designer", // 设计师
  "inspector", // 巡检员
  "property", // 物业管理员
  "admin", // 超级管理员
]);

// ── 装修类型 ──
export const projectTypeEnum = pgEnum("project_type", [
  "full", // 全包
  "half", // 半包
  "clear", // 清包
]);

// ── 装修项目状态 ──
export const projectStatusEnum = pgEnum("project_status", [
  "pending", // 待审批
  "approved", // 已批准
  "constructing", // 施工中
  "accepting", // 验收中
  "completed", // 已完工
  "closed", // 已关闭
]);

// ── 押金状态 ──
export const depositStatusEnum = pgEnum("deposit_status", [
  "unpaid", // 未缴纳
  "paid", // 已缴纳
  "refunded", // 已退还
  "deducted", // 已扣除
]);

// ── 施工阶段状态 ──
export const phaseStatusEnum = pgEnum("phase_status", [
  "pending", // 待开始
  "in_progress", // 进行中
  "completed", // 已完工
  "accepted", // 已验收
]);

// ── 注意事项状态 ──
export const checklistStatusEnum = pgEnum("checklist_status", [
  "pending", // 待确认
  "confirmed", // 已确认
  "completed", // 已完成
  "rectification", // 需整改
]);

// ── 验收类型 ──
export const acceptanceTypeEnum = pgEnum("acceptance_type", [
  "phase", // 阶段验收
  "final", // 竣工验收
]);

// ── 验收结果 ──
export const acceptanceResultEnum = pgEnum("acceptance_result", [
  "passed", // 通过
  "rectification", // 整改
  "rejected", // 驳回
]);

// ── 巡检类型 ──
export const inspectionTypeEnum = pgEnum("inspection_type", [
  "routine", // 定时巡检
  "random", // 抽检
]);

// ── 违规状态 ──
export const violationStatusEnum = pgEnum("violation_status", [
  "pending", // 待整改
  "resolved", // 已整改
  "rechecked", // 已复查
]);

// ── 材料状态 ──
export const materialStatusEnum = pgEnum("material_status", [
  "pending", // 待采购
  "ordered", // 已下单
  "delivered", // 已到货
]);

// ── 通知渠道 ──
export const notificationChannelEnum = pgEnum("notification_channel", [
  "in_app", // 站内
  "sms", // 短信（预留）
  "wechat", // 微信（预留）
]);

// ── 照片类型 ──
export const photoTypeEnum = pgEnum("photo_type", [
  "progress", // 进度照片
  "inspection", // 巡检照片
  "violation", // 违规照片
  "acceptance", // 验收照片
  "material", // 材料照片
]);
