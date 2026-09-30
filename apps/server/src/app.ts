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
import { materialRoutes } from "./modules/material/routes";
import { phaseRoutes } from "./modules/phase/routes";
import { todoRoutes } from "./modules/todo/routes";
import { memberRoutes } from "./modules/member/routes";
import { actionItemRoutes } from "./modules/action-item/routes";
import { issueRoutes } from "./modules/issue/routes";
import { partyRoutes } from "./modules/party/routes";
import { paymentRoutes } from "./modules/payment/routes";
import { changeHistoryRoutes } from "./modules/change-history/routes";

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
app.route("/", materialRoutes);
app.route("/", phaseRoutes);
app.route("/", todoRoutes);
app.route("/", memberRoutes);
app.route("/", actionItemRoutes);
app.route("/", issueRoutes);
app.route("/", partyRoutes);
app.route("/", paymentRoutes);
app.route("/", changeHistoryRoutes);

// 404 处理
app.notFound((c) => {
  return error(c, ErrorCode.NOT_FOUND);
});

// 错误处理
app.onError((err, c) => {
  console.error("Server Error:", err);
  return error(c, ErrorCode.INTERNAL_ERROR);
});
