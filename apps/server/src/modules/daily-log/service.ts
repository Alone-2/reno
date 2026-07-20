import { eq, desc } from "drizzle-orm";
import { db, dailyLog } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import type { CreateDailyLogInput, UpdateDailyLogInput } from "./schema";

export async function listDailyLogs(projectId: string) {
  return db
    .select()
    .from(dailyLog)
    .where(eq(dailyLog.projectId, projectId))
    .orderBy(desc(dailyLog.createdAt));
}

export async function createDailyLog(
  projectId: string,
  authorId: string,
  input: CreateDailyLogInput,
) {
  const [created] = await db
    .insert(dailyLog)
    .values({ projectId, authorId, ...input } as any)
    .returning();
  return created;
}

export async function updateDailyLog(id: string, input: UpdateDailyLogInput) {
  const [updated] = await db
    .update(dailyLog)
    .set(input as any)
    .where(eq(dailyLog.id, id))
    .returning();
  if (!updated) return { error: ErrorCode.NOT_FOUND };
  return { log: updated };
}

export async function deleteDailyLog(id: string) {
  const [deleted] = await db
    .delete(dailyLog)
    .where(eq(dailyLog.id, id))
    .returning({ id: dailyLog.id });
  if (!deleted) return { error: ErrorCode.NOT_FOUND };
  return { success: true };
}
