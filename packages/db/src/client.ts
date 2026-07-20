import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL ?? "postgresql://reno:reno@localhost:5432/reno";

// 用于查询的连接池
const client = postgres(databaseUrl, {
  max: 10,
  prepare: false,
});

export const db = drizzle(client, { schema });

// 导出 schema 供外部使用
export * from "./schema";

// 导出类型
export type Database = typeof db;
