import { PAYMENT_PAYEE_TYPES } from "@reno/shared";
import { z } from "zod";

export const paymentInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  payee: z.string().trim().max(120).nullable().optional(),
  payeePartyId: z.string().uuid().nullable().optional(),
  payeeType: z.enum(PAYMENT_PAYEE_TYPES).default("other"),
  payableAmount: z.coerce.number().min(0),
  paidAmount: z.coerce.number().min(0).default(0),
  dueDate: z.string().date().nullable().optional(),
  paidAt: z.string().datetime().nullable().optional(),
  phaseId: z.string().uuid().nullable().optional(),
  acceptanceId: z.string().uuid().nullable().optional(),
  paymentCondition: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updatePaymentSchema = paymentInputSchema.partial();
export type PaymentInput = z.infer<typeof paymentInputSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
