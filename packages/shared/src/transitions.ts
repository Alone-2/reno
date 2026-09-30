/**
 * 状态合法迁移 — 对齐 PRD §2.5
 * 前端：只展示 canTransition 为 true 的操作
 * 后端：写操作前必须校验
 */

import type {
  ActionItemStatus,
  InspectionItemStatus,
  IssueStatus,
  MaterialStatus,
  NoteStatus,
  ProjectStatus,
  StageStatus,
} from "./enums/index.js";

type TransitionMap<S extends string> = Record<S, readonly S[]>;

export const PROJECT_TRANSITIONS: TransitionMap<ProjectStatus> = {
  planning: ["active"],
  active: ["accepting"],
  accepting: ["active", "done"],
  done: ["archived"],
  archived: [],
};

/** 默认正常路径；returned/cancelled 为分支状态。 */
export const MATERIAL_FORWARD: readonly MaterialStatus[] = [
  "todo",
  "ordered",
  "arrived",
  "installed",
];

export const MATERIAL_TRANSITIONS: TransitionMap<MaterialStatus> = {
  todo: ["ordered", "cancelled"],
  ordered: ["arrived", "returned", "cancelled"],
  arrived: ["installed", "returned"],
  installed: ["returned"],
  returned: ["todo"],
  cancelled: ["todo"],
};

export const STAGE_TRANSITIONS: TransitionMap<StageStatus> = {
  pending: ["ongoing"],
  ongoing: ["done", "pending"],
  done: ["ongoing"],
};

export const NOTE_TRANSITIONS: TransitionMap<NoteStatus> = {
  todo: ["confirmed"],
  confirmed: ["done", "need_fix"],
  need_fix: ["confirmed"],
  done: ["confirmed"],
};

export const ACTION_ITEM_TRANSITIONS: TransitionMap<ActionItemStatus> = {
  todo: ["doing", "done", "cancelled"],
  doing: ["todo", "done", "cancelled"],
  done: ["doing"],
  cancelled: ["todo"],
};

export const ISSUE_TRANSITIONS: TransitionMap<IssueStatus> = {
  open: ["fixing", "resolved"],
  fixing: ["open", "resolved"],
  resolved: ["fixing", "verified"],
  verified: ["fixing"],
};

export const INSPECTION_ITEM_TRANSITIONS: TransitionMap<InspectionItemStatus> = {
  pending: ["passed", "failed"],
  passed: ["pending"],
  failed: ["pending"],
};

export function canTransition<S extends string>(map: TransitionMap<S>, from: S, to: S): boolean {
  if (from === to) return false;
  return (map[from] ?? []).includes(to);
}

export function canProjectTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return canTransition(PROJECT_TRANSITIONS, from, to);
}

export function canMaterialTransition(
  from: MaterialStatus,
  to: MaterialStatus,
  options?: { allowBackward?: boolean },
): boolean {
  if (from === to) return false;
  if (MATERIAL_TRANSITIONS[from].includes(to)) return true;
  if (!options?.allowBackward) return false;
  const fi = MATERIAL_FORWARD.indexOf(from);
  const ti = MATERIAL_FORWARD.indexOf(to);
  return fi >= 0 && ti >= 0 && ti < fi;
}

export function canStageTransition(from: StageStatus, to: StageStatus): boolean {
  return canTransition(STAGE_TRANSITIONS, from, to);
}

export function canNoteTransition(from: NoteStatus, to: NoteStatus): boolean {
  return canTransition(NOTE_TRANSITIONS, from, to);
}

export function canActionItemTransition(from: ActionItemStatus, to: ActionItemStatus): boolean {
  return canTransition(ACTION_ITEM_TRANSITIONS, from, to);
}

export function canIssueTransition(from: IssueStatus, to: IssueStatus): boolean {
  return canTransition(ISSUE_TRANSITIONS, from, to);
}

export function canInspectionItemTransition(
  from: InspectionItemStatus,
  to: InspectionItemStatus,
): boolean {
  return canTransition(INSPECTION_ITEM_TRANSITIONS, from, to);
}

/** 归档项目禁止写业务数据 */
export function isProjectWritable(status: ProjectStatus): boolean {
  return status !== "archived";
}

/** 下单后产生实际采购金额；取消不要求实际单价。 */
export function materialRequiresActualPrice(status: MaterialStatus): boolean {
  return (
    status === "ordered" || status === "arrived" || status === "installed" || status === "returned"
  );
}
