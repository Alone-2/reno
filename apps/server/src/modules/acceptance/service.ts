import { eq, desc } from "drizzle-orm";
import { db, acceptance } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import type { CreateAcceptanceInput } from "./schema";

export async function listAcceptances(projectId: string) {
  return db
    .select()
    .from(acceptance)
    .where(eq(acceptance.projectId, projectId))
    .orderBy(desc(acceptance.createdAt));
}

export async function getAcceptance(id: string) {
  const [item] = await db.select().from(acceptance).where(eq(acceptance.id, id)).limit(1);
  if (!item) return { error: ErrorCode.NOT_FOUND };
  return { acceptance: item };
}

export async function createAcceptance(input: CreateAcceptanceInput) {
  const [created] = await db
    .insert(acceptance)
    .values({ ...input, result: "rectification" } as any)
    .returning();
  return created;
}

export async function updateAcceptanceResult(id: string, result: string, notes?: string) {
  const updateData: any = { result };
  if (notes !== undefined) updateData.notes = notes;

  // 根据角色签名（简化版：记录时间戳）
  const [existing] = await db.select().from(acceptance).where(eq(acceptance.id, id)).limit(1);
  if (!existing) return { error: ErrorCode.NOT_FOUND };

  const [updated] = await db
    .update(acceptance)
    .set(updateData as any)
    .where(eq(acceptance.id, id))
    .returning();
  return { acceptance: updated };
}
