import { eq, desc } from "drizzle-orm";
import { db, space, checklistItem } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import type { CreateSpaceInput, UpdateSpaceInput, CreateChecklistItemInput } from "./schema";

// ── 空间 ──

export async function listSpaces(projectId: string) {
  const items = await db
    .select()
    .from(space)
    .where(eq(space.projectId, projectId))
    .orderBy(desc(space.createdAt));
  return { list: items };
}

export async function getSpace(id: string) {
  const [item] = await db.select().from(space).where(eq(space.id, id)).limit(1);
  if (!item) return { error: ErrorCode.NOT_FOUND };
  return { space: item };
}

export async function createSpace(input: CreateSpaceInput) {
  const [created] = await db
    .insert(space)
    .values({
      projectId: input.projectId,
      name: input.name,
      area: input.area?.toString(),
      notes: input.notes,
    } as any)
    .returning();
  return { space: created };
}

export async function updateSpace(id: string, input: UpdateSpaceInput) {
  const updateData: Record<string, unknown> = { ...input };
  if (input.area !== undefined) {
    updateData.area = input.area.toString();
  }
  const [updated] = await db
    .update(space)
    .set(updateData as any)
    .where(eq(space.id, id))
    .returning();
  if (!updated) return { error: ErrorCode.NOT_FOUND };
  return { space: updated };
}

export async function deleteSpace(id: string) {
  const [deleted] = await db.delete(space).where(eq(space.id, id)).returning({ id: space.id });
  if (!deleted) return { error: ErrorCode.NOT_FOUND };
  return { success: true };
}

// ── 注意事项 ──

export async function listChecklistItems(spaceId: string) {
  const items = await db
    .select()
    .from(checklistItem)
    .where(eq(checklistItem.spaceId, spaceId))
    .orderBy(desc(checklistItem.createdAt));
  return { list: items };
}

export async function createChecklistItem(input: CreateChecklistItemInput) {
  const [created] = await db
    .insert(checklistItem)
    .values({
      spaceId: input.spaceId,
      category: input.category,
      content: input.content,
      linkedPhaseId: input.linkedPhaseId,
    } as any)
    .returning();
  return { checklistItem: created };
}

export async function updateChecklistStatus(
  id: string,
  status: "pending" | "confirmed" | "completed" | "rectification",
) {
  const [updated] = await db
    .update(checklistItem)
    .set({ status } as any)
    .where(eq(checklistItem.id, id))
    .returning();
  if (!updated) return { error: ErrorCode.NOT_FOUND };
  return { checklistItem: updated };
}
