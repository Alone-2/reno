import { eq, asc } from "drizzle-orm";
import { db, projectPhase } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import type { CreatePhaseInput, UpdatePhaseStatusInput } from "./schema";

// ── 查询某项目的阶段列表（按 sortOrder 升序） ──
export async function listPhases(projectId: string) {
  const items = await db
    .select()
    .from(projectPhase)
    .where(eq(projectPhase.projectId, projectId))
    .orderBy(asc(projectPhase.sortOrder));
  return { list: items };
}

// ── 查询单个阶段详情 ──
export async function getPhase(id: string) {
  const [item] = await db.select().from(projectPhase).where(eq(projectPhase.id, id)).limit(1);
  if (!item) return { error: ErrorCode.NOT_FOUND };
  return { phase: item };
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
    } as any)
    .returning();
  return { phase: created };
}

// ── 更新阶段状态（含进度百分比，进行中自动记录 actualStart，完工自动记录 actualEnd） ──
export async function updatePhaseStatus(
  id: string,
  status: UpdatePhaseStatusInput["status"],
  progressPercent?: number,
) {
  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (progressPercent !== undefined) {
    updateData.progressPercent = progressPercent;
  }

  // 进入进行中：若未记录实际开始时间则补记
  if (status === "in_progress") {
    updateData.actualStart = new Date().toISOString().slice(0, 10);
  }

  // 完工：若未记录实际结束时间则补记
  if (status === "completed" || status === "accepted") {
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
  return { phase: updated };
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
