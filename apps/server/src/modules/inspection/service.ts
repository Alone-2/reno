import { eq, desc } from "drizzle-orm";
import { db, inspection, violation } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import type { CreateInspectionInput, CreateViolationInput } from "./schema";
import { canTransitionViolation, type ViolationStatus } from "./workflow";

// ── 巡检 ──
export async function listInspections(projectId: string) {
  return db
    .select()
    .from(inspection)
    .where(eq(inspection.projectId, projectId))
    .orderBy(desc(inspection.createdAt));
}

export async function createInspection(inspectorId: string, input: CreateInspectionInput) {
  const [created] = await db
    .insert(inspection)
    .values({ inspectorId, ...input } as any)
    .returning();
  return created;
}

// ── 违规 ──
export async function listViolations(projectId: string) {
  return db
    .select()
    .from(violation)
    .where(eq(violation.projectId, projectId))
    .orderBy(desc(violation.createdAt));
}

export async function createViolation(input: CreateViolationInput) {
  const [created] = await db
    .insert(violation)
    .values({ ...input, fine: input.fine?.toString() } as any)
    .returning();
  return created;
}

export async function updateViolationStatus(id: string, status: string) {
  const [existing] = await db.select().from(violation).where(eq(violation.id, id)).limit(1);
  if (!existing) return { error: ErrorCode.NOT_FOUND };
  if (!canTransitionViolation(existing.status as ViolationStatus, status as ViolationStatus)) {
    return { error: ErrorCode.INVALID_PARAMS };
  }
  const updateData: any = { status };
  if (status === "resolved") updateData.resolvedAt = new Date();
  const [updated] = await db
    .update(violation)
    .set(updateData as any)
    .where(eq(violation.id, id))
    .returning();
  if (!updated) return { error: ErrorCode.NOT_FOUND };
  return { violation: updated };
}
