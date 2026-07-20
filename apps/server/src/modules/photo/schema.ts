import { z } from "zod";

export const createPhotoSchema = z.object({
  phaseId: z.string().uuid().optional(),
  inspectionId: z.string().uuid().optional(),
  violationId: z.string().uuid().optional(),
  acceptanceId: z.string().uuid().optional(),
  type: z.enum(["progress", "inspection", "violation", "acceptance", "material"]),
  url: z.string().min(1),
  caption: z.string().max(255).optional(),
  tags: z.string().optional(),
});

export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;
