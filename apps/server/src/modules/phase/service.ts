import type { StageStatus } from "@reno/shared";
import { and, eq, asc } from "drizzle-orm";
import { db, projectPhase } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import type { CreatePhaseInput, UpdatePhaseStatusInput } from "./schema";

const PHASE_DB_TO_API: Record<string, StageStatus> = {
  pending: "pending",
  in_progress: "ongoing",
  completed: "done",
  accepted: "done",
};
const PHASE_API_TO_DB: Record<StageStatus, "pending" | "in_progress" | "completed"> = {
  pending: "pending",
  ongoing: "in_progress",
  done: "completed",
};
function phaseDto(item: typeof projectPhase.$inferSelect) {
  return { ...item, status: PHASE_DB_TO_API[item.status] ?? "pending" };
}

// ── 查询某项目的阶段列表（按 sortOrder 升序） ──
export async function listPhases(projectId: string) {
  const items = await db
    .select()
    .from(projectPhase)
    .where(eq(projectPhase.projectId, projectId))
    .orderBy(asc(projectPhase.sortOrder));
  return { list: items.map(phaseDto) };
}

// ── 查询单个阶段详情 ──
export async function getPhase(id: string) {
  const [item] = await db.select().from(projectPhase).where(eq(projectPhase.id, id)).limit(1);
  if (!item) return { error: ErrorCode.NOT_FOUND };
  return { phase: phaseDto(item) };
}

// ── 创建阶段 ──
export async function createPhase(input: CreatePhaseInput) {
  const [created] = await db
    .insert(projectPhase)
    .values({
      projectId: input.projectId,
      phaseName: input.phaseName,
      sortOrder: input.sortOrder,
      plannedStart: input.plannedStart,
      plannedEnd: input.plannedEnd,
      standardPhaseKey: input.standardPhaseKey ?? null,
      isPrimaryCurrent: input.isPrimaryCurrent ?? false,
      isAcceptanceRequired: input.isAcceptanceRequired ?? true,
    } as any)
    .returning();
  if (input.isPrimaryCurrent) await setPrimaryPhase(input.projectId, created.id);
  return { phase: phaseDto(created) };
}

// ── 更新阶段状态（含进度百分比，进行中自动记录 actualStart，完工自动记录 actualEnd） ──
export async function updatePhaseStatus(
  id: string,
  status: UpdatePhaseStatusInput["status"],
  progressPercent?: number,
) {
  const updateData: Record<string, unknown> = {
    status: PHASE_API_TO_DB[status],
    updatedAt: new Date(),
  };

  if (progressPercent !== undefined) {
    updateData.progressPercent = progressPercent;
  }

  // 进入进行中：若未记录实际开始时间则补记
  if (status === "ongoing") {
    updateData.actualStart = new Date().toISOString().slice(0, 10);
  }

  // 完工：若未记录实际结束时间则补记
  if (status === "done") {
    updateData.actualEnd = new Date().toISOString().slice(0, 10);
    if (progressPercent === undefined) {
      updateData.progressPercent = 100;
    }
  }

  const [updated] = await db
    .update(projectPhase)
    .set(updateData as any)
    .where(eq(projectPhase.id, id))
    .returning();

  if (!updated) return { error: ErrorCode.NOT_FOUND };
  return { phase: phaseDto(updated) };
}

export async function setPrimaryPhase(projectId: string, id: string) {
  const [target] = await db
    .select()
    .from(projectPhase)
    .where(and(eq(projectPhase.id, id), eq(projectPhase.projectId, projectId)))
    .limit(1);
  if (!target) return { error: ErrorCode.NOT_FOUND } as const;

  await db.transaction(async (tx) => {
    await tx
      .update(projectPhase)
      .set({ isPrimaryCurrent: false } as any)
      .where(eq(projectPhase.projectId, projectId));
    await tx
      .update(projectPhase)
      .set({ isPrimaryCurrent: true, updatedAt: new Date() } as any)
      .where(eq(projectPhase.id, id));
  });

  const [updated] = await db.select().from(projectPhase).where(eq(projectPhase.id, id)).limit(1);
  return { phase: phaseDto(updated) };
}

// ── 删除阶段 ──
export async function deletePhase(id: string) {
  const [deleted] = await db
    .delete(projectPhase)
    .where(eq(projectPhase.id, id))
    .returning({ id: projectPhase.id });
  if (!deleted) return { error: ErrorCode.NOT_FOUND };
  return { success: true };
}
