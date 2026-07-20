import { Hono } from "hono";
import { success, error } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { listNotifications, markAsRead, markAllAsRead } from "./service";

export const notificationRoutes = new Hono();

// 获取我的通知列表
notificationRoutes.get("/api/notifications", requireAuth, async (c) => {
  const userId = c.get("user")!.userId;
  const unreadOnly = c.req.query("unreadOnly") === "true";
  const items = await listNotifications(userId, unreadOnly);
  return success(c, items);
});

// 标记单条为已读
notificationRoutes.put("/api/notifications/:id/read", requireAuth, async (c) => {
  const id = c.req.param("id");
  const result = await markAsRead(id);
  if ("error" in result) return error(c, result.error);
  return success(c, result.notification);
});

// 全部标记已读
notificationRoutes.put("/api/notifications/read-all", requireAuth, async (c) => {
  const userId = c.get("user")!.userId;
  await markAllAsRead(userId);
  return success(c, null, "全部已读");
});
