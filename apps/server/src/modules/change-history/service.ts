import { desc, eq } from "drizzle-orm";
import { changeHistory, db } from "../../common/db";

export interface ChangeHistoryInput {
  projectId: string;
  entityType: string;
  entityId?: string | null;
  action: "create" | "update" | "status_change" | "delete" | "restore";
  before?: unknown;
  after?: unknown;
  reason?: string | null;
  actorId?: string | null;
}

export async function recordChange(input: ChangeHistoryInput) {
  const [created] = await db
    .insert(changeHistory)
    .values({
      projectId: input.projectId,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      action: input.action,
      before: input.before ?? null,
      after: input.after ?? null,
      reason: input.reason ?? null,
      actorId: input.actorId ?? null,
    } as any)
    .returning();
  return created;
}

export async function listChanges(projectId: string) {
  return db
    .select()
    .from(changeHistory)
    .where(eq(changeHistory.projectId, projectId))
    .orderBy(desc(changeHistory.createdAt));
}
