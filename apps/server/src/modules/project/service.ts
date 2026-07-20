import { eq, desc, sql } from "drizzle-orm";
import { db, renovationProject } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import type { CreateProjectInput, UpdateProjectInput, ApproveProjectInput } from "./schema";

export async function listProjects(status?: string, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const query = db.select().from(renovationProject).$dynamic();

  if (status) {
    query.where(eq(renovationProject.status, status as any));
  }

  const [items, [{ count }]] = await Promise.all([
    query.orderBy(desc(renovationProject.createdAt)).limit(pageSize).offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(renovationProject)
      .where(status ? eq(renovationProject.status, status as any) : sql`true`),
  ]);

  return { list: items, total: count, page, pageSize };
}

export async function getProject(id: string) {
  const [item] = await db
    .select()
    .from(renovationProject)
    .where(eq(renovationProject.id, id))
    .limit(1);
  if (!item) return { error: ErrorCode.NOT_FOUND };
  return { project: item };
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
  return { project: created };
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const [updated] = await db
    .update(renovationProject)
    .set({ ...input, depositAmount: input.depositAmount?.toString() } as any)
    .where(eq(renovationProject.id, id))
    .returning();
  if (!updated) return { error: ErrorCode.NOT_FOUND };
  return { project: updated };
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
  return { project: updated };
}

export async function deleteProject(id: string) {
  const [deleted] = await db
    .delete(renovationProject)
    .where(eq(renovationProject.id, id))
    .returning({ id: renovationProject.id });
  if (!deleted) return { error: ErrorCode.NOT_FOUND };
  return { success: true };
}
