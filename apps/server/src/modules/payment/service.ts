import type { PaymentConditionStatus, PaymentStatus } from "@reno/shared";
import { and, asc, eq } from "drizzle-orm";
import { acceptance, db, paymentPlan, projectPhase } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import { recordChange } from "../change-history/service";
import type { PaymentInput, UpdatePaymentInput } from "./schema";

function derivePaymentStatus(payableAmount: number, paidAmount: number): PaymentStatus {
  if (paidAmount <= 0) return "pending";
  if (paidAmount >= payableAmount) return "paid";
  return "partial";
}

async function conditionStatus(
  row: typeof paymentPlan.$inferSelect,
): Promise<PaymentConditionStatus> {
  if (row.acceptanceId) {
    const [item] = await db
      .select({ result: acceptance.result })
      .from(acceptance)
      .where(eq(acceptance.id, row.acceptanceId))
      .limit(1);
    return item?.result === "passed" ? "met" : "unmet";
  }
  if (row.phaseId) {
    const [item] = await db
      .select({ status: projectPhase.status })
      .from(projectPhase)
      .where(eq(projectPhase.id, row.phaseId))
      .limit(1);
    return item?.status === "completed" || item?.status === "accepted" ? "met" : "unmet";
  }
  return "unknown";
}

async function toDto(row: typeof paymentPlan.$inferSelect) {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    payee: row.payee,
    payeePartyId: row.payeePartyId,
    payableAmount: Number(row.amount),
    paidAmount: Number(row.paidAmount),
    status: derivePaymentStatus(Number(row.amount), Number(row.paidAmount)),
    dueDate: row.dueDate,
    paidAt: row.paidAt?.toISOString() ?? null,
    phaseId: row.phaseId,
    acceptanceId: row.acceptanceId,
    paymentCondition: row.paymentCondition,
    conditionStatus: await conditionStatus(row),
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listPayments(projectId: string) {
  const rows = await db
    .select()
    .from(paymentPlan)
    .where(eq(paymentPlan.projectId, projectId))
    .orderBy(asc(paymentPlan.dueDate), asc(paymentPlan.createdAt));
  return Promise.all(rows.map(toDto));
}

export async function createPayment(projectId: string, input: PaymentInput, actorId?: string) {
  if (input.paidAmount > input.payableAmount) return { error: ErrorCode.INVALID_PARAMS } as const;
  const status = derivePaymentStatus(input.payableAmount, input.paidAmount);
  const [created] = await db
    .insert(paymentPlan)
    .values({
      projectId,
      title: input.title,
      payee: input.payee ?? null,
      payeePartyId: input.payeePartyId ?? null,
      amount: input.payableAmount.toString(),
      paidAmount: input.paidAmount.toString(),
      dueDate: input.dueDate ?? null,
      status,
      paidAt: input.paidAt ? new Date(input.paidAt) : status === "paid" ? new Date() : null,
      phaseId: input.phaseId ?? null,
      acceptanceId: input.acceptanceId ?? null,
      paymentCondition: input.paymentCondition ?? null,
      notes: input.notes ?? null,
      createdBy: actorId ?? null,
    } as any)
    .returning();
  const dto = await toDto(created);
  await recordChange({
    projectId,
    entityType: "payment",
    entityId: created.id,
    action: "create",
    after: dto,
    actorId,
  });
  return { payment: dto };
}

export async function updatePayment(
  projectId: string,
  id: string,
  input: UpdatePaymentInput,
  actorId?: string,
) {
  const [before] = await db
    .select()
    .from(paymentPlan)
    .where(and(eq(paymentPlan.id, id), eq(paymentPlan.projectId, projectId)))
    .limit(1);
  if (!before) return { error: ErrorCode.NOT_FOUND } as const;
  const payable = input.payableAmount ?? Number(before.amount);
  const paid = input.paidAmount ?? Number(before.paidAmount);
  if (paid > payable) return { error: ErrorCode.INVALID_PARAMS } as const;
  const status = derivePaymentStatus(payable, paid);
  const [updated] = await db
    .update(paymentPlan)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.payee !== undefined ? { payee: input.payee } : {}),
      ...(input.payeePartyId !== undefined ? { payeePartyId: input.payeePartyId } : {}),
      ...(input.payableAmount !== undefined ? { amount: input.payableAmount.toString() } : {}),
      ...(input.paidAmount !== undefined ? { paidAmount: input.paidAmount.toString() } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      ...(input.paidAt !== undefined
        ? { paidAt: input.paidAt ? new Date(input.paidAt) : null }
        : {}),
      ...(input.phaseId !== undefined ? { phaseId: input.phaseId } : {}),
      ...(input.acceptanceId !== undefined ? { acceptanceId: input.acceptanceId } : {}),
      ...(input.paymentCondition !== undefined ? { paymentCondition: input.paymentCondition } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      status,
      updatedAt: new Date(),
    } as any)
    .where(and(eq(paymentPlan.id, id), eq(paymentPlan.projectId, projectId)))
    .returning();
  const beforeDto = await toDto(before);
  const dto = await toDto(updated);
  await recordChange({
    projectId,
    entityType: "payment",
    entityId: id,
    action: "update",
    before: beforeDto,
    after: dto,
    actorId,
  });
  return { payment: dto };
}
