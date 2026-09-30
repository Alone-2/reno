import type { MaterialStatus } from "@reno/shared";
import { eq, desc } from "drizzle-orm";
import { db, material, expense } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import type {
  CreateMaterialInput,
  UpdateMaterialInput,
  CreateExpenseInput,
  UpdateExpenseInput,
} from "./schema";

// ── 材料相关 ──

const MATERIAL_DB_TO_API: Record<string, MaterialStatus> = {
  pending: "todo",
  ordered: "ordered",
  delivered: "arrived",
  installed: "installed",
  returned: "returned",
  cancelled: "cancelled",
};

const MATERIAL_API_TO_DB: Record<
  MaterialStatus,
  "pending" | "ordered" | "delivered" | "installed" | "returned" | "cancelled"
> = {
  todo: "pending",
  ordered: "ordered",
  arrived: "delivered",
  installed: "installed",
  returned: "returned",
  cancelled: "cancelled",
};

function materialDto(item: typeof material.$inferSelect) {
  return { ...item, status: MATERIAL_DB_TO_API[item.status] ?? "todo" };
}

export async function listMaterials(projectId: string) {
  const items = await db
    .select()
    .from(material)
    .where(eq(material.projectId, projectId))
    .orderBy(desc(material.createdAt));
  return { list: items.map(materialDto) };
}

export async function getMaterial(id: string) {
  const [item] = await db.select().from(material).where(eq(material.id, id)).limit(1);
  if (!item) return { error: ErrorCode.NOT_FOUND };
  return { material: materialDto(item) };
}

export async function createMaterial(input: CreateMaterialInput) {
  const [created] = await db
    .insert(material)
    .values({
      projectId: input.projectId,
      name: input.name,
      category: input.category,
      spec: input.spec ?? null,
      unit: input.unit,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      totalPrice: input.totalPrice,
      supplier: input.supplier ?? null,
      supplierContact: input.supplierContact ?? null,
      supplierPartyId: input.supplierPartyId ?? null,
      orderNo: input.orderNo ?? null,
      orderDate: input.orderDate ?? null,
      expectedArrivalDate: input.expectedArrivalDate ?? null,
      actualArrivalDate: input.actualArrivalDate ?? null,
      status: input.status ? MATERIAL_API_TO_DB[input.status] : "pending",
      notes: input.notes ?? null,
    } as typeof material.$inferInsert)
    .returning();
  return { material: materialDto(created) };
}

export async function updateMaterial(id: string, input: UpdateMaterialInput) {
  const updateData = {
    ...input,
    ...(input.status ? { status: MATERIAL_API_TO_DB[input.status] } : {}),
    updatedAt: new Date(),
  } as typeof material.$inferInsert;
  const [updated] = await db
    .update(material)
    .set(updateData)
    .where(eq(material.id, id))
    .returning();
  if (!updated) return { error: ErrorCode.NOT_FOUND };
  return { material: materialDto(updated) };
}

export async function deleteMaterial(id: string) {
  const [deleted] = await db
    .delete(material)
    .where(eq(material.id, id))
    .returning({ id: material.id });
  if (!deleted) return { error: ErrorCode.NOT_FOUND };
  return { success: true };
}

// ── 费用相关 ──

export async function listExpenses(projectId: string) {
  const items = await db
    .select()
    .from(expense)
    .where(eq(expense.projectId, projectId))
    .orderBy(desc(expense.createdAt));
  return { list: items };
}

export async function createExpense(input: CreateExpenseInput) {
  const [created] = await db
    .insert(expense)
    .values({
      projectId: input.projectId,
      category: input.category,
      amount: input.amount,
      description: input.description ?? null,
      date: input.date ? new Date(input.date) : new Date(),
      paid: input.paid ? new Date(input.paid) : null,
      invoice: input.invoice ?? null,
      notes: input.notes ?? null,
    } as typeof expense.$inferInsert)
    .returning();
  return { expense: created };
}

export async function updateExpense(id: string, input: UpdateExpenseInput) {
  const updateData: Record<string, unknown> = { ...input };
  if (input.date) updateData.date = new Date(input.date);
  if (input.paid !== undefined) updateData.paid = input.paid ? new Date(input.paid) : null;

  const [updated] = await db.update(expense).set(updateData).where(eq(expense.id, id)).returning();
  if (!updated) return { error: ErrorCode.NOT_FOUND };
  return { expense: updated };
}

export async function deleteExpense(id: string) {
  const [deleted] = await db
    .delete(expense)
    .where(eq(expense.id, id))
    .returning({ id: expense.id });
  if (!deleted) return { error: ErrorCode.NOT_FOUND };
  return { success: true };
}
