import { Hono } from "hono";
import { ErrorCode } from "../../common/error-codes";
import { error, success } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { requireProjectPermission } from "../../middleware/project-permission";
import { partyInputSchema, updatePartySchema } from "./schema";
import { createParty, deactivateParty, listParties, updateParty } from "./service";

export const partyRoutes = new Hono();

partyRoutes.get(
  "/api/projects/:id/parties",
  requireAuth,
  requireProjectPermission("view"),
  async (c) => success(c, await listParties(c.req.param("id"))),
);

partyRoutes.post(
  "/api/projects/:id/parties",
  requireAuth,
  requireProjectPermission("project.manage"),
  async (c) => {
    const parsed = partyInputSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const result = await createParty(c.req.param("id"), parsed.data, c.get("user")?.userId);
    return success(c, result.party);
  },
);

partyRoutes.put(
  "/api/projects/:id/parties/:partyId",
  requireAuth,
  requireProjectPermission("project.manage"),
  async (c) => {
    const parsed = updatePartySchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
    const result = await updateParty(
      c.req.param("id"),
      c.req.param("partyId"),
      parsed.data,
      c.get("user")?.userId,
    );
    if ("error" in result) return error(c, result.error);
    return success(c, result.party);
  },
);

partyRoutes.delete(
  "/api/projects/:id/parties/:partyId",
  requireAuth,
  requireProjectPermission("project.manage"),
  async (c) => {
    const result = await deactivateParty(
      c.req.param("id"),
      c.req.param("partyId"),
      c.get("user")?.userId,
    );
    if ("error" in result) return error(c, result.error);
    return success(c, null);
  },
);
