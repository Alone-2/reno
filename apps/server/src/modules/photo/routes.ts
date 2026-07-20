import { Hono } from "hono";
import { ErrorCode } from "../../common/error-codes";
import { success, error } from "../../common/response";
import { requireAuth } from "../../middleware/auth";
import { createPhotoSchema } from "./schema";
import { listPhotos, createPhoto, deletePhoto } from "./service";

export const photoRoutes = new Hono();

// 获取照片列表
photoRoutes.get("/api/projects/:id/photos", requireAuth, async (c) => {
  const projectId = c.req.param("id");
  const type = c.req.query("type");
  const photos = await listPhotos(projectId, type);
  return success(c, photos);
});

// 上传照片记录（文件本身通过 /api/uploads 上传后拿到 URL）
photoRoutes.post("/api/projects/:id/photos", requireAuth, async (c) => {
  const projectId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = createPhotoSchema.safeParse(body);
  if (!parsed.success) return error(c, ErrorCode.VALIDATION_ERROR, parsed.error.issues[0]?.message);
  const item = await createPhoto(projectId, parsed.data);
  return success(c, item);
});

// 删除照片
photoRoutes.delete("/api/photos/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const result = await deletePhoto(id);
  if ("error" in result) return error(c, result.error);
  return success(c, null, "已删除");
});
