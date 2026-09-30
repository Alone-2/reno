import { and, eq, desc } from "drizzle-orm";
import { db, photo } from "../../common/db";
import { ErrorCode } from "../../common/error-codes";
import type { CreatePhotoInput } from "./schema";

export async function listPhotos(projectId: string, type?: string) {
  const condition = type
    ? and(
        eq(photo.projectId, projectId),
        eq(photo.type, type as (typeof photo.type.enumValues)[number]),
      )
    : eq(photo.projectId, projectId);
  const query = db.select().from(photo).where(condition).$dynamic();
  return query.orderBy(desc(photo.takenAt));
}

export async function createPhoto(projectId: string, input: CreatePhotoInput) {
  const [created] = await db
    .insert(photo)
    .values({ projectId, ...input } as any)
    .returning();
  return created;
}

export async function deletePhoto(id: string) {
  const [deleted] = await db.delete(photo).where(eq(photo.id, id)).returning({ id: photo.id });
  if (!deleted) return { error: ErrorCode.NOT_FOUND };
  return { success: true };
}
