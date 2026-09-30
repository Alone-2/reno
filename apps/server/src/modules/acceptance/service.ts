import { and, eq, desc } from "drizzle-orm";
import { db, acceptance, issue } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import type { CreateAcceptanceInput } from "./schema";
import { canTransitionAcceptance, type AcceptanceResult } from "./workflow";
import { changeIssueStatus, createIssue } from "../issue/service";

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
  if (!canTransitionAcceptance(existing.result as AcceptanceResult, result as AcceptanceResult)) {
    return { error: ErrorCode.INVALID_PARAMS };
  }

  const [linkedIssue] = await db
    .select()
    .from(issue)
    .where(
      and(
        eq(issue.projectId, existing.projectId),
        eq(issue.sourceType, "acceptance"),
        eq(issue.sourceEntityId, existing.id),
      ),
    )
    .limit(1);

  if (result === "passed" && linkedIssue && linkedIssue.status !== "verified") {
    if (linkedIssue.status !== "resolved") return { error: ErrorCode.INVALID_PARAMS };
    const verified = await changeIssueStatus(
      existing.projectId,
      linkedIssue.id,
      "verified",
      linkedIssue.resolutionNotes,
      "验收复验通过",
    );
    if ("error" in verified) return verified;
  }

  const [updated] = await db
    .update(acceptance)
    .set(updateData as any)
    .where(eq(acceptance.id, id))
    .returning();

  if (result === "rectification" && !linkedIssue) {
    await createIssue(existing.projectId, {
      title: existing.type === "final" ? "整体验收问题" : "阶段验收问题",
      description: notes || existing.notes || "验收未通过，需完成整改后复验",
      severity: "high",
      sourceType: "acceptance",
      sourceEntityId: existing.id,
      stageId: existing.phaseId,
    });
  }

  return { acceptance: updated };
}
