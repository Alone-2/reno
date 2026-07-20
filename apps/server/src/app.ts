import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ErrorCode } from "./common/error-codes";
import { error } from "./common/response";
import { authRoutes } from "./modules/auth/routes";
import { projectRoutes } from "./modules/project/routes";
import { spaceRoutes } from "./modules/space/routes";
import { dailyLogRoutes } from "./modules/daily-log/routes";
import { inspectionRoutes } from "./modules/inspection/routes";
import { acceptanceRoutes } from "./modules/acceptance/routes";
import { photoRoutes } from "./modules/photo/routes";
import { notificationRoutes } from "./modules/notification/routes";

// Hono 应用实例与路由定义,与 serve() 分离以便测试(hono/testing)
export const app = new Hono();

// 中间件
app.use("*", logger());
app.use("*", cors());

// 健康检查
app.get("/api/health", (c) => {
  return c.json({
    code: 0,
    message: "ok",
    data: { status: "ok", message: "Reno API Server is running" },
  });
});

// 挂载业务路由
app.route("/", authRoutes);
app.route("/", projectRoutes);
app.route("/", spaceRoutes);
app.route("/", dailyLogRoutes);
app.route("/", inspectionRoutes);
app.route("/", acceptanceRoutes);
app.route("/", photoRoutes);
app.route("/", notificationRoutes);

// 404 处理
app.notFound((c) => {
  return error(c, ErrorCode.NOT_FOUND);
});

// 错误处理
app.onError((err, c) => {
  console.error("Server Error:", err);
  return error(c, ErrorCode.INTERNAL_ERROR);
});
