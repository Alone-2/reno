import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  content: z.string().optional(),
  channel: z.enum(["in_app", "sms", "wechat"]).default("in_app"),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
