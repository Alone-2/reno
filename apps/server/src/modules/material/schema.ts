import { z } from "zod";

// ── 创建材料 ──
export const createMaterialSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  spec: z.string().max(100).optional(),
  unit: z.string().min(1).max(20),
  quantity: z.string().min(0),
  unitPrice: z.string().min(0),
  totalPrice: z.string().min(0),
  supplier: z.string().max(100).optional(),
  supplierContact: z.string().max(100).optional(),
  notes: z.string().optional(),
});

export const updateMaterialSchema = createMaterialSchema.partial();

// ── 创建费用 ──
export const createExpenseSchema = z.object({
  projectId: z.string().uuid(),
  category: z.string().min(1).max(50),
  amount: z.string().min(0),
  description: z.string().max(255).optional(),
  date: z.string().datetime().optional(),
  paid: z.string().datetime().nullable().optional(),
  invoice: z.string().max(255).optional(),
  notes: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
