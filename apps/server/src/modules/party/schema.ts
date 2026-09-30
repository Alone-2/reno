import { PARTY_TYPES } from "@reno/shared";
import { z } from "zod";

export const partyInputSchema = z.object({
  type: z.enum(PARTY_TYPES),
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().max(160).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  wechat: z.string().trim().max(80).nullable().optional(),
  responsibility: z.string().trim().max(240).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updatePartySchema = partyInputSchema.partial();
export type PartyInput = z.infer<typeof partyInputSchema>;
export type UpdatePartyInput = z.infer<typeof updatePartySchema>;
