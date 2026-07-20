import { eq, desc } from "drizzle-orm";
import { db, notification } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import type { CreateNotificationInput } from "./schema";

export async function listNotifications(userId: string, _unreadOnly = false) {
  const query = db.select().from(notification).where(eq(notification.userId, userId));
  // TODO: unreadOnly 筛选
  return query.orderBy(desc(notification.createdAt));
}

export async function createNotification(input: CreateNotificationInput) {
  const [created] = await db
    .insert(notification)
    .values(input as any)
    .returning();
  return created;
}

export async function markAsRead(id: string) {
  const [updated] = await db
    .update(notification)
    .set({ read: true } as any)
    .where(eq(notification.id, id))
    .returning();
  if (!updated) return { error: ErrorCode.NOT_FOUND };
  return { notification: updated };
}

export async function markAllAsRead(userId: string) {
  await db
    .update(notification)
    .set({ read: true } as any)
    .where(eq(notification.userId, userId));
  return { success: true };
}
