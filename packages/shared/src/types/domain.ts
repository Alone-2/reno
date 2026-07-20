/**
 * 领域实体 — 前端列表/详情/表单所需数据结构
 * 金额单位：分（integer），避免浮点；展示层再 /100 格式化为元。
 * ID：string（UUID）。时间：ISO 8601 字符串。
 */

import type { BudgetSummary } from "../budget.js";
import type {
  BudgetHealth,
  InspectionItemStatus,
  MaterialStatus,
  NoteStatus,
  PaymentPayeeType,
  PaymentStatus,
  ProjectStatus,
  ProjectType,
  StageStatus,
  UserRole,
} from "../enums/index.js";

// ── 基础 ──────────────────────────────────────────────

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface User extends Timestamps {
  id: string;
  username: string;
  displayName: string | null;
  role: UserRole;
}

// ── 项目 ──────────────────────────────────────────────

export interface Project extends Timestamps {
  id: string;
  ownerId: string;
  name: string;
  /** 地址 */
  address: string | null;
  type: ProjectType;
  /** 风格描述（自由文本，MVP） */
  style: string | null;
  status: ProjectStatus;
  /** 总预算，分 */
  totalBudget: number;
  /** 计划开工 */
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  remark: string | null;
}

/** 创建 / 编辑项目（前端表单） */
export interface ProjectInput {
  name: string;
  address?: string | null;
  type: ProjectType;
  style?: string | null;
  totalBudget: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  remark?: string | null;
}

export interface ProjectStatusChange {
  status: ProjectStatus;
}

// ── 空间 / 分区 / 家具 ────────────────────────────────

export interface Space extends Timestamps {
  id: string;
  projectId: string;
  name: string;
  /** 排序，升序 */
  sortOrder: number;
  areaSqm: number | null;
  remark: string | null;
}

export interface SpaceInput {
  name: string;
  sortOrder?: number;
  areaSqm?: number | null;
  remark?: string | null;
}

export interface Zone extends Timestamps {
  id: string;
  spaceId: string;
  projectId: string;
  name: string;
  locationDesc: string | null;
  /** 长×宽×高，mm 或自由文本；MVP 用字符串 */
  dimensions: string | null;
  planNote: string | null;
  sortOrder: number;
}

export interface ZoneInput {
  name: string;
  locationDesc?: string | null;
  dimensions?: string | null;
  planNote?: string | null;
  sortOrder?: number;
}

export interface Furniture extends Timestamps {
  id: string;
  projectId: string;
  spaceId: string;
  zoneId: string | null;
  name: string;
  brand: string | null;
  model: string | null;
  qty: number;
  remark: string | null;
}

export interface FurnitureInput {
  spaceId: string;
  zoneId?: string | null;
  name: string;
  brand?: string | null;
  model?: string | null;
  qty?: number;
  remark?: string | null;
}

// ── 注意事项 ──────────────────────────────────────────

export interface Note extends Timestamps {
  id: string;
  projectId: string;
  spaceId: string | null;
  zoneId: string | null;
  stageId: string | null;
  title: string;
  content: string | null;
  status: NoteStatus;
  /** 是否来自模板 */
  fromTemplate: boolean;
  sortOrder: number;
}

export interface NoteInput {
  spaceId?: string | null;
  zoneId?: string | null;
  stageId?: string | null;
  title: string;
  content?: string | null;
  status?: NoteStatus;
  sortOrder?: number;
}

// ── 建材 ──────────────────────────────────────────────

export interface MaterialCategory extends Timestamps {
  id: string;
  projectId: string | null;
  /** null projectId = 系统预置品类 */
  name: string;
  sortOrder: number;
}

export interface Material extends Timestamps {
  id: string;
  projectId: string;
  categoryId: string | null;
  name: string;
  brand: string | null;
  spec: string | null;
  unit: string;
  /** 计划数量 */
  plannedQty: number;
  /** 预估单价，分 */
  estimatedUnitPrice: number;
  /** 实际单价，分；bought 起必填 */
  actualUnitPrice: number | null;
  status: MaterialStatus;
  channel: string | null;
  purchaseUrl: string | null;
  remark: string | null;
}

export interface MaterialInput {
  categoryId?: string | null;
  name: string;
  brand?: string | null;
  spec?: string | null;
  unit: string;
  plannedQty: number;
  estimatedUnitPrice: number;
  actualUnitPrice?: number | null;
  status?: MaterialStatus;
  channel?: string | null;
  purchaseUrl?: string | null;
  remark?: string | null;
}

export interface MaterialStatusChange {
  status: MaterialStatus;
  /** 进入 bought 及之后时必填 */
  actualUnitPrice?: number | null;
}

/** 建材使用位置 */
export interface MaterialLocation extends Timestamps {
  id: string;
  materialId: string;
  projectId: string;
  spaceId: string;
  zoneId: string | null;
  locationDesc: string | null;
  qty: number;
  purpose: string | null;
}

export interface MaterialLocationInput {
  spaceId: string;
  zoneId?: string | null;
  locationDesc?: string | null;
  qty: number;
  purpose?: string | null;
}

// ── 款项 ──────────────────────────────────────────────

export interface Payment extends Timestamps {
  id: string;
  projectId: string;
  stageId: string | null;
  title: string;
  payeeType: PaymentPayeeType;
  /** 应付，分 */
  payableAmount: number;
  /** 已付，分 */
  paidAmount: number;
  status: PaymentStatus;
  dueDate: string | null;
  paidAt: string | null;
  remark: string | null;
}

export interface PaymentInput {
  stageId?: string | null;
  title: string;
  payeeType: PaymentPayeeType;
  payableAmount: number;
  paidAmount?: number;
  status?: PaymentStatus;
  dueDate?: string | null;
  paidAt?: string | null;
  remark?: string | null;
}

// ── 施工阶段 / 日志 ───────────────────────────────────

export interface Stage extends Timestamps {
  id: string;
  projectId: string;
  name: string;
  sortOrder: number;
  status: StageStatus;
  /** 0–100 */
  progressPercent: number;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  remark: string | null;
}

export interface StageInput {
  name: string;
  sortOrder?: number;
  status?: StageStatus;
  progressPercent?: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  remark?: string | null;
}

export interface StageLog extends Timestamps {
  id: string;
  projectId: string;
  stageId: string;
  content: string;
  /** 图片 URL 列表（MVP） */
  imageUrls: string[];
  loggedAt: string;
}

export interface StageLogInput {
  stageId: string;
  content: string;
  imageUrls?: string[];
  loggedAt?: string;
}

// ── 验收 ──────────────────────────────────────────────

export interface Inspection extends Timestamps {
  id: string;
  projectId: string;
  stageId: string;
  title: string;
  /** 汇总：全部 passed 才算阶段通过（业务层） */
  remark: string | null;
}

export interface InspectionItem extends Timestamps {
  id: string;
  inspectionId: string;
  projectId: string;
  /** 来源注意事项，可空 */
  noteId: string | null;
  title: string;
  status: InspectionItemStatus;
  comment: string | null;
  imageUrls: string[];
  sortOrder: number;
}

export interface InspectionItemInput {
  noteId?: string | null;
  title: string;
  status?: InspectionItemStatus;
  comment?: string | null;
  imageUrls?: string[];
  sortOrder?: number;
}

export interface InspectionItemStatusChange {
  status: InspectionItemStatus;
  comment?: string | null;
  imageUrls?: string[];
}

// ── 首页 / 聚合（前端专用视图） ───────────────────────

export interface TodoCard {
  id: string;
  kind: "budget" | "material" | "stage_overdue" | "inspection" | "note";
  title: string;
  subtitle: string | null;
  severity: "info" | "warn" | "danger" | "ok";
  /** 跳转用 */
  href?: string;
  projectId: string;
}

export interface ProjectOverview {
  project: Project;
  budget: BudgetSummary;
  budgetHealth: BudgetHealth;
  materialCounts: {
    total: number;
    todo: number;
    bought: number;
    arrived: number;
    installed: number;
  };
  currentStage: Stage | null;
  todos: TodoCard[];
}

// ── 认证 ──────────────────────────────────────────────

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  password: string;
  displayName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}
