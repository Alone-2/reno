import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  content: z.string().optional(),
  href: z.string().max(500).optional(),
  channel: z.enum(["in_app", "sms", "wechat"]).default("in_app"),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
