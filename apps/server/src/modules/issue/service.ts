import { canIssueTransition } from "@reno/shared";
import { and, asc, eq, ne } from "drizzle-orm";
import { db, issue } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import { recordChange } from "../change-history/service";
import type { IssueInput, UpdateIssueInput } from "./schema";

export async function listIssues(projectId: string, includeVerified = false) {
  const condition = includeVerified
    ? eq(issue.projectId, projectId)
    : and(eq(issue.projectId, projectId), ne(issue.status, "verified"));
  return db.select().from(issue).where(condition).orderBy(asc(issue.dueDate), asc(issue.createdAt));
}

export async function createIssue(projectId: string, input: IssueInput, actorId?: string) {
  const [created] = await db
    .insert(issue)
    .values({ projectId, ...input } as any)
    .returning();
  await recordChange({
    projectId,
    entityType: "issue",
    entityId: created.id,
    action: "create",
    after: created,
    actorId,
  });
  return { issue: created };
}

export async function updateIssue(
  projectId: string,
  id: string,
  input: UpdateIssueInput,
  actorId?: string,
) {
  const [before] = await db
    .select()
    .from(issue)
    .where(and(eq(issue.id, id), eq(issue.projectId, projectId)))
    .limit(1);
  if (!before) return { error: ErrorCode.NOT_FOUND } as const;
  const [updated] = await db
    .update(issue)
    .set({ ...input, updatedAt: new Date() } as any)
    .where(and(eq(issue.id, id), eq(issue.projectId, projectId)))
    .returning();
  await recordChange({
    projectId,
    entityType: "issue",
    entityId: id,
    action: "update",
    before,
    after: updated,
    actorId,
  });
  return { issue: updated };
}

export async function changeIssueStatus(
  projectId: string,
  id: string,
  status: "open" | "fixing" | "resolved" | "verified",
  resolutionNotes?: string | null,
  reason?: string,
  actorId?: string,
) {
  const [before] = await db
    .select()
    .from(issue)
    .where(and(eq(issue.id, id), eq(issue.projectId, projectId)))
    .limit(1);
  if (!before) return { error: ErrorCode.NOT_FOUND } as const;
  if (!canIssueTransition(before.status, status))
    return { error: ErrorCode.INVALID_PARAMS } as const;
  const now = new Date();
  const [updated] = await db
    .update(issue)
    .set({
      status,
      resolutionNotes: resolutionNotes === undefined ? before.resolutionNotes : resolutionNotes,
      resolvedAt:
        status === "resolved" || status === "verified" ? (before.resolvedAt ?? now) : null,
      verifiedAt: status === "verified" ? now : null,
      updatedAt: now,
    } as any)
    .where(eq(issue.id, id))
    .returning();
  await recordChange({
    projectId,
    entityType: "issue",
    entityId: id,
    action: "status_change",
    before,
    after: updated,
    reason,
    actorId,
  });
  return { issue: updated };
}
