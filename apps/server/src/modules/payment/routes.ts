import { Hono } from "hono";
import { ErrorCode } from "../../common/error-codes";
import { error, success } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { requireProjectPermission } from "../../middleware/project-permission";
import { paymentInputSchema, updatePaymentSchema } from "./schema";
import { createPayment, listPayments, updatePayment } from "./service";

export const paymentRoutes = new Hono();

paymentRoutes.get(
  "/api/projects/:id/payments",
  requireAuth,
  requireProjectPermission("view"),
  async (c) => success(c, await listPayments(c.req.param("id"))),
);

paymentRoutes.post(
  "/api/projects/:id/payments",
  requireAuth,
  requireProjectPermission("finance.write"),
  async (c) => {
    const parsed = paymentInputSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const result = await createPayment(c.req.param("id"), parsed.data, c.get("user")?.userId);
    if ("error" in result) return error(c, result.error);
    return success(c, result.payment);
  },
);

paymentRoutes.put(
  "/api/projects/:id/payments/:paymentId",
  requireAuth,
  requireProjectPermission("finance.write"),
  async (c) => {
    const parsed = updatePaymentSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const result = await updatePayment(
      c.req.param("id"),
      c.req.param("paymentId"),
      parsed.data,
      c.get("user")?.userId,
    );
    if ("error" in result) return error(c, result.error);
    return success(c, result.payment);
  },
);
