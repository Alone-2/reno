import { and, asc, eq } from "drizzle-orm";
import { db, party } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import { recordChange } from "../change-history/service";
import type { PartyInput, UpdatePartyInput } from "./schema";

export async function listParties(projectId: string) {
  return db
    .select()
    .from(party)
    .where(and(eq(party.projectId, projectId), eq(party.active, true)))
    .orderBy(asc(party.name));
}

export async function createParty(projectId: string, input: PartyInput, actorId?: string) {
  const [created] = await db
    .insert(party)
    .values({ projectId, ...input } as any)
    .returning();
  await recordChange({
    projectId,
    entityType: "party",
    entityId: created.id,
    action: "create",
    after: created,
    actorId,
  });
  return { party: created };
}

export async function updateParty(
  projectId: string,
  id: string,
  input: UpdatePartyInput,
  actorId?: string,
) {
  const [before] = await db
    .select()
    .from(party)
    .where(and(eq(party.id, id), eq(party.projectId, projectId)))
    .limit(1);
  if (!before) return { error: ErrorCode.NOT_FOUND } as const;
  const [updated] = await db
    .update(party)
    .set({ ...input, updatedAt: new Date() } as any)
    .where(and(eq(party.id, id), eq(party.projectId, projectId)))
    .returning();
  await recordChange({
    projectId,
    entityType: "party",
    entityId: id,
    action: "update",
    before,
    after: updated,
    actorId,
  });
  return { party: updated };
}

export async function deactivateParty(projectId: string, id: string, actorId?: string) {
  const [before] = await db
    .select()
    .from(party)
    .where(and(eq(party.id, id), eq(party.projectId, projectId)))
    .limit(1);
  if (!before) return { error: ErrorCode.NOT_FOUND } as const;
  const [updated] = await db
    .update(party)
    .set({ active: false, updatedAt: new Date() } as any)
    .where(and(eq(party.id, id), eq(party.projectId, projectId)))
    .returning();
  await recordChange({
    projectId,
    entityType: "party",
    entityId: id,
    action: "delete",
    before,
    after: updated,
    actorId,
  });
  return { success: true } as const;
}
