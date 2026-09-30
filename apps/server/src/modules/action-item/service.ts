import { canActionItemTransition } from "@reno/shared";
import { and, asc, eq, ne } from "drizzle-orm";
import { actionItem, db } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import { recordChange } from "../change-history/service";
import type { ActionItemInput, UpdateActionItemInput } from "./schema";

export async function listActionItems(projectId: string, includeDone = false) {
  const condition = includeDone
    ? eq(actionItem.projectId, projectId)
    : and(eq(actionItem.projectId, projectId), ne(actionItem.status, "done"));
  return db
    .select()
    .from(actionItem)
    .where(condition)
    .orderBy(asc(actionItem.dueDate), asc(actionItem.createdAt));
}

export async function createActionItem(
  projectId: string,
  input: ActionItemInput,
  actorId?: string,
) {
  const completedAt = input.status === "done" ? new Date() : null;
  const [created] = await db
    .insert(actionItem)
    .values({ projectId, ...input, completedAt } as any)
    .returning();
  await recordChange({
    projectId,
    entityType: "action_item",
    entityId: created.id,
    action: "create",
    after: created,
    actorId,
  });
  return { item: created };
}

export async function updateActionItem(
  projectId: string,
  id: string,
  input: UpdateActionItemInput,
  actorId?: string,
) {
  const [before] = await db
    .select()
    .from(actionItem)
    .where(and(eq(actionItem.id, id), eq(actionItem.projectId, projectId)))
    .limit(1);
  if (!before) return { error: ErrorCode.NOT_FOUND } as const;
  const next = { ...input, updatedAt: new Date() } as Record<string, unknown>;
  if (input.status !== undefined) next.completedAt = input.status === "done" ? new Date() : null;
  const [updated] = await db
    .update(actionItem)
    .set(next as any)
    .where(and(eq(actionItem.id, id), eq(actionItem.projectId, projectId)))
    .returning();
  await recordChange({
    projectId,
    entityType: "action_item",
    entityId: id,
    action: "update",
    before,
    after: updated,
    actorId,
  });
  return { item: updated };
}

export async function changeActionItemStatus(
  projectId: string,
  id: string,
  status: ActionItemInput["status"],
  reason?: string,
  actorId?: string,
) {
  const [before] = await db
    .select()
    .from(actionItem)
    .where(and(eq(actionItem.id, id), eq(actionItem.projectId, projectId)))
    .limit(1);
  if (!before) return { error: ErrorCode.NOT_FOUND } as const;
  if (!canActionItemTransition(before.status, status))
    return { error: ErrorCode.INVALID_PARAMS } as const;
  const [updated] = await db
    .update(actionItem)
    .set({
      status,
      completedAt: status === "done" ? new Date() : null,
      updatedAt: new Date(),
    } as any)
    .where(eq(actionItem.id, id))
    .returning();
  await recordChange({
    projectId,
    entityType: "action_item",
    entityId: id,
    action: "status_change",
    before,
    after: updated,
    reason,
    actorId,
  });
  return { item: updated };
}

export async function deleteActionItem(projectId: string, id: string, actorId?: string) {
  const [deleted] = await db
    .delete(actionItem)
    .where(and(eq(actionItem.id, id), eq(actionItem.projectId, projectId)))
    .returning();
  if (!deleted) return { error: ErrorCode.NOT_FOUND } as const;
  await recordChange({
    projectId,
    entityType: "action_item",
    entityId: id,
    action: "delete",
    before: deleted,
    actorId,
  });
  return { success: true } as const;
}
