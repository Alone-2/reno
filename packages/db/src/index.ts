// @reno/db — 数据库 schema + client
// 用法:
//   import { db, user } from '@reno/db'
//   import { eq } from 'drizzle-orm'
//   const result = await db.select().from(user).where(eq(user.id, id))

export { db } from "./client";
export type { Database } from "./client";
export * from "./schema";
