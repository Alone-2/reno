import { canProjectTransition, type ProjectStatus } from "@reno/shared";
import { eq, desc, sql, inArray, or, and } from "drizzle-orm";
import { db, renovationProject, projectMember } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import type { CreateProjectInput, UpdateProjectInput, ApproveProjectInput } from "./schema";
import { recordChange } from "../change-history/service";

const PROJECT_DB_TO_API: Record<string, ProjectStatus> = {
  pending: "planning",
  approved: "planning",
  constructing: "active",
  accepting: "accepting",
  completed: "done",
  closed: "archived",
};

const PROJECT_API_TO_DB: Record<
  ProjectStatus,
  "approved" | "constructing" | "accepting" | "completed" | "closed"
> = {
  planning: "approved",
  active: "constructing",
  accepting: "accepting",
  done: "completed",
  archived: "closed",
};

function projectDto(item: typeof renovationProject.$inferSelect) {
  return { ...item, status: PROJECT_DB_TO_API[item.status] ?? "planning" };
}

function projectStatusCondition(status: ProjectStatus) {
  if (status === "planning") {
    return inArray(renovationProject.status, ["pending", "approved"]);
  }
  return eq(renovationProject.status, PROJECT_API_TO_DB[status]);
}

export async function listProjects(
  userId: string,
  globalRole: string,
  status?: string,
  page = 1,
  pageSize = 20,
) {
  const offset = (page - 1) * pageSize;
  const memberships =
    globalRole === "admin"
      ? []
      : await db
          .select({ projectId: projectMember.projectId })
          .from(projectMember)
          .where(eq(projectMember.userId, userId));
  const memberProjectIds = memberships.map((item) => item.projectId);
  const accessCondition =
    globalRole === "admin"
      ? sql`true`
      : memberProjectIds.length
        ? or(eq(renovationProject.ownerId, userId), inArray(renovationProject.id, memberProjectIds))
        : eq(renovationProject.ownerId, userId);
  const condition = status
    ? and(accessCondition, projectStatusCondition(status as ProjectStatus))
    : accessCondition;
  const query = db.select().from(renovationProject).$dynamic();

  const [items, [{ count }]] = await Promise.all([
    query
      .where(condition)
      .orderBy(desc(renovationProject.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(renovationProject)
      .where(condition),
  ]);

  return { list: items.map(projectDto), total: count, page, pageSize };
}

export async function getProject(id: string) {
  const [item] = await db
    .select()
    .from(renovationProject)
    .where(eq(renovationProject.id, id))
    .limit(1);
  if (!item) return { error: ErrorCode.NOT_FOUND };
  return { project: projectDto(item) };
}

export async function createProject(input: CreateProjectInput, userId: string) {
  const [created] = await db
    .insert(renovationProject)
    .values({
      ...input,
      ownerId: input.ownerId ?? userId,
      depositAmount: input.depositAmount?.toString(),
    } as any)
    .returning();
  await db
    .insert(projectMember)
    .values({
      projectId: created.id,
      userId: created.ownerId,
      role: "owner",
      permissions: [
        "view",
        "project.manage",
        "member.manage",
        "file.manage",
        "progress.write",
        "finance.write",
        "finance.approve",
        "acceptance.write",
      ],
      invitedBy: userId,
    } as any)
    .onConflictDoNothing();
  return { project: projectDto(created) };
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const [updated] = await db
    .update(renovationProject)
    .set({ ...input, depositAmount: input.depositAmount?.toString() } as any)
    .where(eq(renovationProject.id, id))
    .returning();
  if (!updated) return { error: ErrorCode.NOT_FOUND };
  return { project: projectDto(updated) };
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
  reason?: string,
  actorId?: string,
) {
  const [before] = await db
    .select()
    .from(renovationProject)
    .where(eq(renovationProject.id, id))
    .limit(1);
  if (!before) return { error: ErrorCode.NOT_FOUND } as const;
  const current = PROJECT_DB_TO_API[before.status] ?? "planning";
  if (!canProjectTransition(current, status)) return { error: ErrorCode.INVALID_PARAMS } as const;

  const [updated] = await db
    .update(renovationProject)
    .set({ status: PROJECT_API_TO_DB[status], updatedAt: new Date() } as any)
    .where(eq(renovationProject.id, id))
    .returning();
  await recordChange({
    projectId: id,
    entityType: "project",
    entityId: id,
    action: "status_change",
    before: projectDto(before),
    after: projectDto(updated),
    reason,
    actorId,
  });
  return { project: projectDto(updated) };
}

export async function approveProject(id: string, input: ApproveProjectInput) {
  const status = input.approved ? "approved" : "pending";
  const [updated] = await db
    .update(renovationProject)
    .set({
      status,
      rejectReason: input.approved ? null : input.rejectReason,
      permitNo: input.permitNo ?? null,
    } as any)
    .where(eq(renovationProject.id, id))
    .returning();
  if (!updated) return { error: ErrorCode.NOT_FOUND };
  return { project: projectDto(updated) };
}

export async function deleteProject(id: string) {
  const [deleted] = await db
    .delete(renovationProject)
    .where(eq(renovationProject.id, id))
    .returning({ id: renovationProject.id });
  if (!deleted) return { error: ErrorCode.NOT_FOUND };
  return { success: true };
}
