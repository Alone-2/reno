/**
 * 状态合法迁移 — 对齐 PRD §2.5
 * 前端：只展示 canTransition 为 true 的操作
 * 后端：写操作前必须校验
 */

import type {
  InspectionItemStatus,
  MaterialStatus,
  NoteStatus,
  ProjectStatus,
  StageStatus,
} from "./enums/index.js";

type TransitionMap<S extends string> = Record<S, readonly S[]>;

export const PROJECT_TRANSITIONS: TransitionMap<ProjectStatus> = {
  planning: ["purchasing", "constructing"],
  purchasing: ["constructing", "accepting"],
  constructing: ["accepting", "purchasing"],
  accepting: ["done", "constructing"],
  done: ["archived"],
  archived: [],
};

/** 默认向前；回退需 force=true（业主确认） */
export const MATERIAL_FORWARD: readonly MaterialStatus[] = [
  "todo",
  "bought",
  "arrived",
  "installed",
] as const;

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
  const fi = MATERIAL_FORWARD.indexOf(from);
  const ti = MATERIAL_FORWARD.indexOf(to);
  if (fi < 0 || ti < 0) return false;
  if (ti > fi) return true;
  return options?.allowBackward === true;
}

export function canStageTransition(from: StageStatus, to: StageStatus): boolean {
  return canTransition(STAGE_TRANSITIONS, from, to);
}

export function canNoteTransition(from: NoteStatus, to: NoteStatus): boolean {
  return canTransition(NOTE_TRANSITIONS, from, to);
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

/** bought 及之后必须有实际单价 */
export function materialRequiresActualPrice(status: MaterialStatus): boolean {
  return status !== "todo";
}
